const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: String,
    email: { type: String, unique: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume" },
    autoAttachResume: { type: Boolean, default: false },
    profilePhoto: String,
    friends: [{ type: String }],
    isFrenchVerified: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
        default: "FREE",
      },
      applicationsUsed: {
        type: Number,
        default: 0,
      },
      applicationLimit: {
        type: Number,
        default: 1,
      },
      startDate: Date,
      endDate: Date,
    },

    loginHistory: [
      {
        ip: String,
        browser: String,
        os: String,
        deviceType: String,
        loginTime: { type: Date, default: Date.now },
      },
    ],

    otp: String,
    otpExpiry: Date,
    isOtpVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
