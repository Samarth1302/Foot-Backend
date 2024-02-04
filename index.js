const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const passRoutes = require("./routes/passRoutes");
const infoRoutes = require("./routes/infoRoutes");

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
