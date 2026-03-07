const express = require("express")
const router = express.Router()

const Internship = require("../Model/Internship");

router.post("/", async (req, res) => {
    const Internshipdata = new Internship({
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        category: req.body.category,
        aboutCompany: req.body.aboutCompany,
        aboutInternship: req.body.aboutInternship,
        whoCanApply: req.body.whoCanApply,
        perks: req.body.perks,
        numberOfOpenings: req.body.numberOfOpenings,
        stipend: req.body.stipend,
        startDate: req.body.startDate,
        additionalInfo: req.body.additionalInfo,
    });
    await Internshipdata.save()
        .then((data) => {
            res.send(data);
        })
        .catch((error) => {
            console.log(error);
        });
});
router.get("/", async (req, res) => {
  try {
    const data = await Internship.find();
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 🔥 Prevent crash if id is invalid
    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid internship ID" });
    }

    const data = await Internship.findById(id);

    if (!data) {
      return res.status(404).json({ error: "Internship not found" });
    }

    res.status(200).json(data);

  } catch (error) {
    console.log("Internship fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;