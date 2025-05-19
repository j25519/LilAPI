import sqlite3 from 'sqlite3'
import 'dotenv/config'

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Database connection error:', err.message)
  } else {
    console.log('Connected to SQLite database')
  }
})

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apiKey TEXT UNIQUE NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `)

  db.run(`INSERT OR IGNORE INTO users (apiKey) VALUES (?)`, [process.env.API_KEY])
})

export const getUserByApiKey = (apiKey) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE apiKey = ?`, [apiKey], (err, row) => {
      if (err) reject(err)
      resolve(row)
    })
  })
}

export const getItems = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM items`, (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })
}

export const createItem = (name) => {
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO items (name) VALUES (?)`, [name], function (err) {
      if (err) reject(err)
      resolve({ id: this.lastID, name })
    })
  })
}

export const deleteItem = (id) => {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM items WHERE id = ?`, [id], function (err) {
      if (err) reject(err)
      resolve(this.changes)
    })
  })
}