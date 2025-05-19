import express from 'express'
import { WebSocketServer } from 'ws'
import fs from 'fs'
import { logger } from './logger.js'
import { authMiddleware } from './middleware.js'
import { setupRoutes } from './routes.js'

const app = express()
const port = 3000

app.use(express.json())

app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`)
  next()
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
          const lines = data.split('\n').slice(-2) // Send last line
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