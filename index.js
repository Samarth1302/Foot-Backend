const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const cron = require("node-cron");
const passRoutes = require("./routes/passRoutes");
const infoRoutes = require("./routes/infoRoutes");
const { performOps } = require("./utils/standing.js")
const app = express();
const port = 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/auth", authRoutes);
app.use("/security", passRoutes);
app.use("/info", infoRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

cron.schedule("0 0 * * *", async () => {
  const firstBatch = [39, 40, 44, 61, 71, 78, 88, 94, 128];
  const secondBatch = [135, 140, 142, 253, 254, 262, 307, 323];
  const seasonYear = 2023;

  await performOps(firstBatch, seasonYear);

  setTimeout(async () => {
    await performOps(secondBatch, seasonYear);
  }, 1 * 60 * 1000);
});