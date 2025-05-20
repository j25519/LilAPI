import express from 'express'
import { WebSocketServer } from 'ws'
import fs from 'fs'
import helmet from 'helmet'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import rateLimit from 'express-rate-limit'
import { logger } from './logger.js'
import { authMiddleware } from './middleware.js'
import { setupRoutes } from './routes.js'
import { getItems, getUserByEmail, getUserByApiKey } from './db.js'
import 'dotenv/config'

const app = express()
const port = 3000

// Security headers via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}))

// CORS for Webflow site (update to production domain)
app.use(cors({
  origin: 'http://localhost:5173', // Change to 'https://your-webflow-site.webflow.io' in production
}))

// Cache-Control and Server headers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Server', 'LilAPI')
  next()
})

// Pretty print the JSON with newline after for clean terminal output
app.set('json spaces', 2)

// Add newline to JSON responses for clean curl output
app.use((req, res, next) => {
  const originalJson = res.json
  res.json = function (obj) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(obj, null, 2) + '\n')
    return res
  }
  next()
})

app.use(express.json())

app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`)
  next()
})

// JWT middleware
const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) {
    logger.warn('Missing JWT token')
    return res.status(401).json({ error: 'Authentication token required' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    logger.warn('Invalid JWT token')
    return res.status(401).json({ error: 'Invalid authentication token' })
  }
}

// Login endpoint
app.post('/login', async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    logger.warn('Missing login credentials')
    return res.status(400).json({ error: 'Email and password required' })
  }
  try {
    const user = await getUserByEmail(email)
    if (!user || !user.password) {
      logger.warn('Invalid login credentials')
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      logger.warn('Invalid login credentials')
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ token })
  } catch (err) {
    logger.error(`Login error: ${err.message}`)
    next(err)
  }
})

// Proxy endpoint for UI (dev mode, server-side API_KEY auth)
app.get('/proxy/data', async (req, res, next) => {
  try {
    const user = await getUserByApiKey(process.env.API_KEY)
    if (!user) {
      logger.warn('Invalid server API key')
      return res.status(401).json({ error: 'Invalid server API key' })
    }
    const items = await getItems()
    res.json(items)
  } catch (err) {
    logger.error(`Proxy error: ${err.message}`)
    next(err)
  }
})

// Secure proxy endpoint for Webflow (production, JWT auth, rate limiting)
app.get('/secure/proxy/data', 
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 requests per IP
  }),
  verifyJWT,
  async (req, res, next) => {
    try {
      const user = await getUserByApiKey(process.env.API_KEY)
      if (!user) {
        logger.warn('Invalid server API key')
        return res.status(401).json({ error: 'Invalid server API key' })
      }
      const items = await getItems()
      res.json(items)
    } catch (err) {
      logger.error(`Proxy error: ${err.message}`)
      next(err)
    }
})

setupRoutes(app, authMiddleware)

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`)
  res.status(500).json({ error: 'Internal server error' })
})

const server = app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`)
})

// WebSocket server for log streaming
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected')

  // Send initial log content
  fs.readFile('logs/app.log', 'utf8', (err, data) => {
    if (!err) {
      data.split('\n').forEach(line => {
        if (line) ws.send(line)
      })
    }
  })

  // Watch log file for changes
  fs.watch('logs/app.log', (eventType) => {
    if (eventType === 'change') {
      fs.readFile('logs/app.log', 'utf8', (err, data) => {
        if (!err) {
          const lines = data.split('\n').slice(-2)
          lines.forEach(line => {
            if (line) ws.send(line)
          })
        }
      })
    }
  })

  ws.on('close', () => {
    logger.info('WebSocket client disconnected')
  })
})