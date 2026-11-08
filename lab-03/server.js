const express = require("express");
const initializeDatabase = require("./database");

const app = express();

app.use(express.json());

let db = null;

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Lab 03!");
});

// Get all books with search, sorting, filtering and pagination
app.get("/books", async (req, res) => {
    try {
        const {
            search_q = "",
            order_by = "id",
            order = "ASC",
            limit = 10,
            offset = 0,
            min_price,
            max_price
        } = req.query;

        // Allow only valid columns for sorting
        const allowedOrderBy = ["id", "title", "author", "year", "price"];
        const sortColumn = allowedOrderBy.includes(order_by)
            ? order_by
            : "id";

        // Allow only ASC or DESC
        const sortOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        let sql = "SELECT * FROM books WHERE title LIKE ?";
        const parameters = [`%${search_q}%`];

        // Add minimum price filter
        if (min_price !== undefined) {
            sql += " AND price >= ?";
            parameters.push(Number(min_price));
        }

        // Add maximum price filter
        if (max_price !== undefined) {
            sql += " AND price <= ?";
            parameters.push(Number(max_price));
        }

        // Add sorting and pagination
        sql += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        parameters.push(Number(limit), Number(offset));

        const rows = await db.all(sql, parameters);

        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
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

        res.status(200).json(row);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Add a new book with validation
app.post("/books", async (req, res) => {
    const { title, author, year, price } = req.body;

    // Validate title
    if (!title || title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    // Validate author
    if (!author || author.trim() === "") {
        return res.status(400).json({
            message: "Author is required"
        });
    }

    // Validate price
    if (price === undefined || price === "" || isNaN(Number(price))) {
        return res.status(400).json({
            message: "Price must be a numeric value"
        });
    }

    try {
        const result = await db.run(
            `INSERT INTO books (title, author, year, price)
             VALUES (?, ?, ?, ?)`,
            [title, author, year || null, Number(price)]
        );

        res.status(201).json({
            message: "Book added successfully",
            id: result.lastID
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Update a book using ID
app.put("/books/:id", async (req, res) => {
    const { title, author, year, price } = req.body;

    try {
        const result = await db.run(
            `UPDATE books
             SET title = ?, author = ?, year = ?, price = ?
             WHERE id = ?`,
            [title, author, year, price, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
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

        res.status(200).json({
            message: "Book deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Use deployment port or local port
const PORT = process.env.PORT || 3000;

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