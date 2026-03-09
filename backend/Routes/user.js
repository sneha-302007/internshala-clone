const express = require("express");
const router = express.Router();
const User = require("../Model/User");
const sendOtpEmail = require("../utils/sendOtpEmail");

const getDeviceInfo = (req) => {
  const ua = req.headers["user-agent"] || "";

  let browser = "Unknown";
  let os = "Unknown";
  let deviceType = "Desktop";

  // Browser detection
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  // OS & Device
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Android")) {
    os = "Android";
    deviceType = "Mobile";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    deviceType = "Mobile";
  } else if (ua.includes("Mac")) os = "Mac";

  return { browser, os, deviceType };
};

// 📌 Helper: Get client IP address
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "Unknown"
  );
};

// ⏰ Helper: Check mobile access time (10 AM – 1 PM)
const isMobileAccessAllowed = () => {
  const now = new Date();

  const currentHour = now.getHours(); // 0–23

  return currentHour >= 10 && currentHour < 13;
};

// 🔁 SYNC user (create or update)
router.post("/sync", async (req, res) => {
  try {
    const { uid, name, email, profilePhoto } = req.body;

    // 🔹 existing helpers (already in your file)
    const ip = getClientIp(req);
    const { browser, os, deviceType } = getDeviceInfo(req);

    // 🚫 Mobile device time restriction
    if (deviceType === "Mobile" && !isMobileAccessAllowed()) {
      return res.status(403).json({
        status: "MOBILE_TIME_RESTRICTED",
        message: "Mobile access is allowed only between 10 AM and 1 PM",
      });
    }

    // 🔹 existing login history object
    const loginEntry = {
      ip,
      browser,
      os,
      deviceType,
      loginTime: new Date(),
    };

    // 🔐 NEW: Chrome → OTP logic
    let otpRequired = false;
    let otp = null;

    if (browser === "Chrome") {
      otpRequired = true;
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 🔹 existing upsert logic (extended, not changed)
    const user = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          name,
          email,
          profilePhoto,
          ...(otpRequired && {
            otp,
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
            isOtpVerified: false,
          }),
        },
        $push: { loginHistory: loginEntry },
      },
      { upsert: true, new: true },
    );
    if (otpRequired) {
      try {
        await sendOtpEmail(user.email, otp, "login");
      } catch (err) {
        console.error("OTP email failed:", err);
        return res.status(500).json({
          status: "EMAIL_FAILED",
          message: "Failed to send OTP",
        });
      }

      return res.status(200).json({
        status: "OTP_REQUIRED",
        message: "OTP sent to registered email",
      });
    }

    // 🔹 existing success response
    res.status(200).json({
      status: "SUCCESS",
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.error("Sync route error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//ADD OTP verification route
router.post("/verify-otp", async (req, res) => {
  const { uid, otp, type } = req.body;

  const user = await User.findOne({ uid });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  if (type === "french") {
    user.isFrenchVerified = true;
  } else {
    user.isOtpVerified = true;
  }

  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  res.json({ success: true });
});

// Send OTP for French activation
router.post("/send-otp", async (req, res) => {
  const { uid, purpose } = req.body;

  const user = await User.findOne({ uid });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
  user.isOtpVerified = false;

  await user.save();

  await sendOtpEmail(user.email, otp, purpose || "login");

  res.json({ success: true, message: "OTP sent" });
});

// 👤 Get user by firebase uid
router.get("/uid/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👥 Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD FRIEND
router.put("/add-friend/:uid", async (req, res) => {
  const { friendUid } = req.body;

  const user = await User.findOne({ uid: req.params.uid });
  const friend = await User.findOne({ uid: friendUid });

  if (!user || !friend)
    return res.status(404).json({ error: "User not found" });

  if (!user.friends.includes(friendUid)) {
    user.friends.push(friendUid);
  }

  if (!friend.friends.includes(req.params.uid)) {
    friend.friends.push(req.params.uid);
  }

  await user.save();
  await friend.save();

  res.json({
    message: "Friend added",
    userFriends: user.friends.length,
    friendFriends: friend.friends.length,
  });
});

router.put("/remove-friend/:uid", async (req, res) => {
  try {
    console.log("REMOVE FRIEND HIT");
    console.log("User UID (me):", req.params.uid);
    console.log("Friend UID:", req.body.friendUid);

    const { friendUid } = req.body;

    const user = await User.findOne({ uid: req.params.uid });
    const friend = await User.findOne({ uid: friendUid });

    console.log("User found:", !!user);
    console.log("Friend found:", !!friend);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    user.friends = user.friends.filter((f) => f !== friendUid);
    friend.friends = friend.friends.filter((f) => f !== req.params.uid);

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed" });
  } catch (err) {
    console.error("REMOVE FRIEND ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/login-history/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid }).select("loginHistory");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sortedHistory = user.loginHistory.sort(
      (a, b) => new Date(b.loggedInAt) - new Date(a.loggedInAt),
    );

    res.status(200).json(sortedHistory);
  } catch (error) {
    console.error("Login history fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/user.js
router.post("/save-resume", async (req, res) => {
  const { uid, resumeId } = req.body;

  if (!uid || !resumeId) {
    return res.status(400).json({ message: "uid and resumeId required" });
  }

  const user = await User.findOneAndUpdate(
    { uid },
    { resume: resumeId },
    { new: true },
  );

  res.json({ message: "Resume saved to profile", user });
});

router.post("/auto-attach-resume", async (req, res) => {
  const { uid } = req.body;

  await User.findOneAndUpdate({ uid }, { autoAttachResume: true });

  res.json({ message: "Auto attach enabled" });
});

// Get user profile with resume populated
router.get("/profile", async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ message: "UID required" });
    }

    const user = await User.findOne({ uid }).populate("resume"); // 🔥 this is the key

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        photo: user.profilePhoto,
      },
      resume: user.resume || null,
      autoAttachResume: user.autoAttachResume || false,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
