const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

const app = express();
const port = 4000;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(passport.initialize());

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email,
          });

          await user.save();
        }

        const token = generateAuthToken(user);
        user.token = token;
        await user.save();
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const oldUserByEmail = await User.findOne({ email });
    if (oldUserByEmail) {
      return res
        .status(400)
        .json({ error: "User with the same email already exists" });
    }

    const oldUserByUsername = await User.findOne({ username });
    if (oldUserByUsername) {
      return res
        .status(400)
        .json({ error: "User with the same username already exists" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = jwt.sign(
      {
        user_id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    user.token = token;

    await user.save();

    const emailSubject = "Welcome to FootZone";
    const emailHTML = `
      <p>Hello ${username}</p>
      <p>Have an awesome kickeroo.</p>
    `;
    res.status(201).json({
      id: user.id,
      ...user._doc,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User couldn't be saved to the system" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ error: "User not found. Sign up first." });
    }

    if (!user.password && password) {
      return res.status(201).json({
        error: "No password set. Login using Google or press Forgot Password",
      });
    }

    if (user.password) {
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (isPasswordCorrect) {
        const token = jwt.sign(
          {
            user_id: user._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );
        user.token = token;
        await user.save();
        return res.status(200).json({
          id: user.id,
          ...user._doc,
        });
      } else {
        return res.status(201).json({ error: "Incorrect Password" });
      }
    } else {
      return res.status(400).json({ error: "Password required for login" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
