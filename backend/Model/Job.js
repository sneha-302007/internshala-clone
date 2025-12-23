const mongoose = require("mongoose");
const JobShcema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    category: String,
    aboutCompany: String,
    aboutJob: String,
    WhoCanApply: String,
    perks: Array,
    additionalInfo: String,
    CTC: String,
    numberOfOpenings:String,
    startDate: String,
    createAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("Job", JobShcema);