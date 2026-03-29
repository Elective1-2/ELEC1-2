require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(helmet());

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

app.use("/health", healthRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;