
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const dbPath = path.join(__dirname, 'users.db')

const initializeDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `)

  return db
}

module.exports = initializeDB
