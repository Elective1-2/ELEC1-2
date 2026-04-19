require("dotenv").config();
require("./config/passport");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");


const healthRoutes = require("./routes/health.routes");
const dbTestRoutes = require("./routes/db-test.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const locationRoutes = require('./routes/location.routes');
const trafficRoutes = require('./routes/traffic.routes');
const mapRoutes = require('./routes/map.routes');


const app = express();
const isProd = process.env.NODE_ENV === "production";

app.use(helmet());
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

//? TESTING ROUTES
app.use("/health", healthRoutes);
app.use("/db-test", dbTestRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(cookieParser());

//? TESTING 

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;