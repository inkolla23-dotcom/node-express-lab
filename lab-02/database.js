const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function initializeDatabase() {
    const db = await open({
        filename: "./books.db",
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            year INTEGER
        )
    `);

    return db;
}

module.exports = initializeDatabase;