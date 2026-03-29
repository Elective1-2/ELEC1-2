require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const healthRoutes = require("./routes/health.routes");
const dbTestRoutes = require("./routes/db-test.routes");

const app = express();

app.use(helmet());

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

//? TESTING 
// app.use("/health", healthRoutes);
app.use("/db-test", dbTestRoutes);
//? TESTING 

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;