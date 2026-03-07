const mongoose = require("mongoose")
const Applicationschema = new mongoose.Schema({
    company: String,
    category: String,
    coverLetter: String,
    user: {
        uid: String,
        name: String,
        email: String
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending"
    },
    Application: Object,
})
module.exports = mongoose.model("Application", Applicationschema)