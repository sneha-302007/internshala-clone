const mongoose = require("mongoose");

// OTP in-memory storage
const otpStore = new Map();

const resumeSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  qualification: { type: String, required: true },
  professional: { type: String },
  skills: { type: String },
  about: { type: String },
  photo: { type: String }, // base64 or URL
  createdAt: { type: Date, default: Date.now },
});

// Static method to send OTP
resumeSchema.statics.sendOtp = async function (email, sendOtpEmail) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
  otpStore.set(email, { otp, expiresAt });
  await sendOtpEmail(email, otp, "resume");
};

// Static method to verify OTP
resumeSchema.statics.verifyOtp = function (email, otp) {
  const record = otpStore.get(email);
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    otpStore.delete(email);
    return false;
  }
  if (record.otp !== otp) return false;
  otpStore.delete(email);
  return true;
};

module.exports = mongoose.model("Resume", resumeSchema);


