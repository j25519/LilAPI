import { getItems, createItem, deleteItem } from './db.js'
import { logger } from './logger.js'

export const setupRoutes = (app, authMiddleware) => {
  // Public health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() })
  })

  // Protected endpoints
  app.get('/api/data', authMiddleware, async (req, res, next) => {
    try {
      const items = await getItems()
      res.json(items)
    } catch (err) {
      next(err)
    }
  })

  app.post('/api/data', authMiddleware, async (req, res, next) => {
    const { name } = req.body
    if (!name) {
      logger.warn('Missing name in POST /api/data')
      return res.status(400).json({ error: 'Name is required' })
    }
    try {
      const item = await createItem(name)
      res.status(201).json(item)
    } catch (err) {
      next(err)
    }
  })

  app.delete('/api/data/:id', authMiddleware, async (req, res, next) => {
    const { id } = req.params
    try {
      const changes = await deleteItem(id)
      if (changes === 0) {
        logger.warn(`Item not found: ${id}`)
        return res.status(404).json({ error: 'Item not found' })
      }
      res.json({ message: 'Item deleted' })
    } catch (err) {
      next(err)
    }
  })
}