const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendEmail } = require("../utils/nodemailer");
const crypto = require("crypto");

async function signup(req, res) {
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
    const verificationToken = generateRandomCode(6);

    user.token = verificationToken;

    const verificationLink = `${process.env.FRONTEND_URL}/signup?token=${verificationToken}&email=${user.email}`;

    const emailSubject = "Verify your FootZone account";
    const emailHTML = `
      <p>Hello ${username},</p>
      <p>Thank you for signing up with FootZone. Please click the link below to verify your account:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `;
    sendEmail(user.email, emailSubject, emailHTML);

    await user.save();
    res.status(201).json({
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User couldn't be saved to the system" });
  }
}
async function verify(req, res) {
  const { token, email } = req.query;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (token !== user.token) {
      return res.status(400).json({ error: "Invalid verification code" });
    }
    user.isVerified = true;
    const authToken = jwt.sign(
      {
        user_id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    user.token = authToken;
    await user.save();
    return res.status(200).json({
      token: user.token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function login(req, res) {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ error: "User not found. Sign up first." });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ error: "User not verified. Please verify your email." });
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
            username: user.username,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );
        user.token = token;
        await user.save();
        return res.status(200).json({
          token: user.token,
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
}

module.exports = {
  signup,
  login,
  verify,
};

function generateRandomCode(length) {
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~`!@#$%^&*()-_+={}[]|:;>.<,?/";
  const randomBytes = crypto.randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i++) {
    const byte = randomBytes[i] % chars.length;
    code += chars.charAt(byte);
  }

  return code;
}
