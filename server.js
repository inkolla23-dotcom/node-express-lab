const express = require("express");

const app = express();
const PORT = 3000;

// Home route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to my Node.js and Express server!");
});

// About route
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Kolla Indhu",
    section: "AIML 2B"
  });
});

// Time route
app.get("/time", (req, res) => {
  res.status(200).json({
    dateTime: new Date()
  });
});

// 404 route - for unknown paths
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});