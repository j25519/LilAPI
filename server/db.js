import sqlite3 from 'sqlite3'
import 'dotenv/config'
import bcrypt from 'bcrypt'

const db = new sqlite3.Database('database.db', (err) => {
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
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      apiKey TEXT UNIQUE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `)

  // Hash and insert API key
  if (process.env.API_KEY) {
    bcrypt.hash(process.env.API_KEY, 10, (err, hashedKey) => {
      if (err) {
        console.error('Error hashing API key:', err.message)
        return
      }
      db.run(`INSERT OR IGNORE INTO users (email, password, apiKey) VALUES (?, ?, ?)`, 
        ['admin@example.com', 'not-used', hashedKey], 
        (err) => {
          if (err) {
            console.error('Error inserting hashed API key:', err.message)
          }
        })
    })
  } else {
    console.error('API_KEY not found in .env')
  }
})

export const getUserByApiKey = async (apiKey) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE id = 1`, async (err, row) => {
      if (err) {
        reject(err)
        return
      }
      if (!row) {
        resolve(null)
        return
      }
      try {
        const isMatch = await bcrypt.compare(apiKey, row.apiKey)
        resolve(isMatch ? row : null)
      } catch (err) {
        reject(err)
      }
    })
  })
}

export const getUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
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