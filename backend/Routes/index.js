const express = require("express");
const router = express.Router();
const admin = require("./admin");
const intern = require("./internship");
const job = require("./job");
const application=require("./application");


router.use("/admin", admin);
router.use("/internship", intern);
router.use("/job", job);
router.use("/application", application);


//router.use("/login-history", require("./loginHistory"));
router.use("/posts", require("./post"));
router.use("/users", require("./user"));
router.use("/resume", require("./resume")); 



module.exports = router;