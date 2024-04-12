const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cron = require("node-cron");

const { fetchCompData } = require("./utils/fixture.js");
const { performOps } = require("./utils/standing.js");
const { fetchAndStoreFootballNews } = require("./utils/fetchNews.js");
const authRoutes = require("./routes/authRoutes");
const passRoutes = require("./routes/passRoutes");
const shopRoutes = require("./routes/shopRoutes.js");
const infoRoutes = require("./routes/infoRoutes");
const newsRoutes = require("./routes/newsRoutes.js");
const commRoutes = require("./routes/commRoutes.js");
const matchRoutes = require("./routes/matchRoutes.js");

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
app.use("/pass", passRoutes);
app.use("/info", infoRoutes);
app.use("/news", newsRoutes);
app.use("/comm", commRoutes);
app.use("/match", matchRoutes);
app.use("/shop", shopRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

cron.schedule("0 */6 * * *", async () => {
  const firstBatch = [39, 40, 61, 71, 78, 88, 94, 128];
  const secondBatch = [135, 140, 253, 254, 262, 307, 323];
  const seasonYear = 2023;

  await performOps(firstBatch, seasonYear);

  setTimeout(async () => {
    await performOps(secondBatch, seasonYear);
  }, 1 * 60 * 1000);
});

cron.schedule("10 */4 * * *", async () => {
  await fetchAndStoreFootballNews();
});

cron.schedule("20 1 * * *", async () => {
  const competitionCodes = [
    "BSA",
    "PL",
    "ELC",
    "FL1",
    "BL1",
    "SA",
    "DED",
    "PPL",
    "PD",
    "CL",
    "CLI",
  ];

  const batch1 = competitionCodes.slice(0, 6);
  const batch2 = competitionCodes.slice(6);

  await fetchCompData(batch1);
  await new Promise((resolve) => setTimeout(resolve, 60000));
  await fetchCompData(batch2);

  console.log("Match & Scorer job completed.");
});
