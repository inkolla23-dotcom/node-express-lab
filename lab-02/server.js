const express = require("express");
const initializeDatabase = require("./database");

const app = express();

app.use(express.json());

let db = null;

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Lab 02!");
});

// Add a new book
app.post("/books", async (req, res) => {
    const { title, author, year } = req.body;

    const sql = `
        INSERT INTO books (title, author, year)
        VALUES (?, ?, ?)
    `;

    try {
        const result = await db.run(sql, [title, author, year]);

        res.status(201).json({
            message: "Book added successfully",
            id: result.lastID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all books
app.get("/books", async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM books");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific book using ID
app.get("/books/:id", async (req, res) => {
    try {
        const row = await db.get(
            "SELECT * FROM books WHERE id = ?",
            [req.params.id]
        );

        if (!row) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a book using ID
app.put("/books/:id", async (req, res) => {
    const { title, author, year } = req.body;

    try {
        const result = await db.run(
            `UPDATE books
             SET title = ?, author = ?, year = ?
             WHERE id = ?`,
            [title, author, year, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book updated successfully"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a book using ID
app.delete("/books/:id", async (req, res) => {
    try {
        const result = await db.run(
            "DELETE FROM books WHERE id = ?",
            [req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book deleted successfully"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;

// Initialize database and start server
async function initializeDBAndServer() {
    try {
        db = await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to the database:", err.message);
        process.exit(1);
    }
}

initializeDBAndServer();