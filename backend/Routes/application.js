const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const User = require("../Model/User");
const Resume = require("../Model/Resume");

router.post("/", async (req, res) => {
  console.log("FULL BODY:", req.body);
  console.log("USER OBJECT:", req.body.user);
  console.log("UID VALUE:", req.body.user?.uid);

  try {
    const { company, category, coverLetter, user, Application, availability } = req.body;

    if (!user || !user.uid) {
      return res.status(400).json({ message: "User information missing" });
    }


    // 🔥 STEP 1: Get User from DB
    const dbUser = await User.findOne({ uid: user.uid });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    // 🔥 STEP 2: Check subscription expiry
    if (
      dbUser.subscription?.endDate &&
      now > dbUser.subscription.endDate
    ) {
      dbUser.subscription.plan = "FREE";
      dbUser.subscription.applicationLimit = 1;
      dbUser.subscription.applicationsUsed = 0;
      await dbUser.save();
    }

    // 🔥 STEP 3: Check application limit
    if (
      dbUser.subscription.applicationLimit !== Infinity &&
      dbUser.subscription.applicationsUsed >=
      dbUser.subscription.applicationLimit
    ) {
      return res.status(403).json({
        message: "Application limit reached for your plan!! Upgrade plan to apply more.",
      });
    }

    // 🔥 STEP 4: Auto Attach Resume
    const resumeDoc = await Resume.findOne({ uid: user.uid });

    const applicationData = new application({
      company,
      category,
      coverLetter,
      user,
      Application,
      resume: resumeDoc ? resumeDoc._id : null,
    });

    const savedApplication = await applicationData.save();

    // 🔥 STEP 5: Increase usage count
    dbUser.subscription.applicationsUsed += 1;
    await dbUser.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application: savedApplication,
    });

  } catch (error) {
    console.error("Application create error:", error);
    res.status(500).json({ message: "Failed to apply" });
  }
});



// router.post("/", async (req, res) => {
//   const applicationipdata = new application({
//     company: req.body.company,
//     category: req.body.category,
//     coverLetter: req.body.coverLetter,
//     user: req.body.user,
//     Application: req.body.Application,
//     body: req.body.body,
//   });
//   await applicationipdata
//     .save()
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

router.get("/", async (req, res) => {
  try {
    const data = await application
      .find()
      .populate("resume")   // auto-attached resume
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    console.error("Admin application fetch error:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application
      .findById(id)
      .populate("resume"); // 🔥 IMPORTANT

    if (!data) {
      return res.status(404).json({ error: "application not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  let status;
  if (action === "approved") {
    status = "approved";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updateapplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({ success: true, data: updateapplication });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});

router.post("/auto-attach-resume", async (req, res) => {
  try {
    const { uid } = req.body;

    const resume = await Resume.findOne({ uid });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // later: attach resume._id to every new application
    res.json({
      message: "Resume will be auto-attached to applications",
      resumeId: resume._id
    });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});



module.exports = router;