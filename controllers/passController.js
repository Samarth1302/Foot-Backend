const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendEmail } = require("../utils/nodemailer");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        error: "Email not verified. Please verify your email first.",
      });
    }

    const newPassword = crypto.randomBytes(3).toString("hex");
    const encryptedPassword = await bcrypt.hash(newPassword, 10);

    user.password = encryptedPassword;
    await user.save();

    const emailSubject = "New Password";
    const emailHTML = `
      <p>Hello ${user.username},</p>
      <p>Your new password is: ${newPassword}</p>
      <p>After logging in, we recommend changing your password.</p>
    `;
    await sendEmail(user.email, emailSubject, emailHTML);

    res.status(200).json({
      success: true,
      message: "Check your mail and spam inbox for new password.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Password reset failed" });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  try {
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userFromDB = await User.findOne({ _id: user.user_id });
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      userFromDB.password
    );
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }
    const encryptedNewPassword = await bcrypt.hash(newPassword, 10);
    userFromDB.password = encryptedNewPassword;
    await userFromDB.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Password change failed" });
  }
};

module.exports = { forgotPassword, changePassword };
