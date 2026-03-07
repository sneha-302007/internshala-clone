const express = require("express");
const router = express.Router();
const Resume = require("../Model/Resume");
const sendOtpEmail = require("../utils/sendOtpEmail");
const User = require("../Model/User");


// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await Resume.sendOtp(email, sendOtpEmail);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP ONLY
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isValid = Resume.verifyOtp(email, otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.json({
      status: "SUCCESS",
      otpVerified: true,
      message: "OTP verified successfully"
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

// Create resume (premium)
router.post("/create", async (req, res) => {
  try {
    const {
      uid,
      name,
      email,
      phone,
      qualification,
      professional,
      skills,
      about,
      photo,
      paymentVerified
    } = req.body;

    if (!uid) {
      console.log("❌ UID missing in request body");
      return res
        .status(400)
        .json({ message: "User not authenticated (uid missing)" });
    }

    if (!req.body.paymentVerified) {
      return res.status(403).json({ message: "Payment required" });
    }

    const existingResume = await Resume.findOne({ uid });

    if (existingResume) {
      return res.status(409).json({
        message: "Resume already exists. Please update it instead."
      });
    }

    const resume = await Resume.create({
      uid,
      name,
      email,
      phone,
      qualification,
      professional,
      skills,
      about,
      photo,
    });
    await User.findOneAndUpdate(
      { uid },
      {
        resume: resume._id,
        autoAttachResume: true,
      },
      { new: true }
    );
    res.json({ message: "Resume created successfully", resume });
  } catch (err) {
    console.log("Resume payload:", req.body);
    console.error("Create Resume Error:", err);
    res.status(500).json({ message: "Failed to create resume" });
  }
});
// Get resume of logged-in user
router.get("/my", async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ message: "UID required" });
    }

    const resume = await Resume.findOne({ uid });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { uid, ...data } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "UID required" });
    }

    const resume = await Resume.findOneAndUpdate(
      { uid },
      data,
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ message: "Resume updated successfully", resume });
  } catch (err) {
    console.error("Update Resume Error:", err);
    res.status(500).json({ message: "Failed to update resume" });
  }
});

// Check if resume exists for profile page
router.get("/exists/:uid", async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ exists: false });
  }

  const resume = await Resume.findOne({ uid }).select("_id");

  res.json({ exists: !!resume });
});

module.exports = router;

