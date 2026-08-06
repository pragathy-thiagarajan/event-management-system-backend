const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
require("dotenv").config();
connectDB();
console.log("Env variables...",process.env.JWT_SECRET);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Running",
  });
});

app.use("/api/auth", authRoutes);

module.exports = app;