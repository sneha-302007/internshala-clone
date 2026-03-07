const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // 🔹 MongoDB reference to User document
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Firebase UID (used in your APIs)
    uid: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
      required: true,
    },

    invoiceId: {
      type: String,
      required: true,
    },

    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
