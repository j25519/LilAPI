import { getUserByApiKey } from './db.js'
import { logger } from './logger.js'

export const authMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey) {
    logger.warn('Missing API key')
    return res.status(401).json({ error: 'API key required' })
  }

  try {
    const user = await getUserByApiKey(apiKey)
    if (!user) {
      logger.warn(`Invalid API key`)
      return res.status(401).json({ error: 'Invalid API key' })
    }
    next()
  } catch (err) {
    logger.error(`Authentication error: ${err.message}`)
    next(err)
  }
}