const cron = require("node-cron");
const User = require("../models/User");

async function cleanupUnverifiedUsers() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log("Unverified users cleanup completed.");
  } catch (err) {
    console.error("Error cleaning up unverified users:", err);
  }
}

module.exports = { cleanupUnverifiedUsers };
