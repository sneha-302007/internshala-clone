
const express = require("express");
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");

const router = express.Router();

// Create order
router.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: 50 * 100, // ₹50 in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Verify payment
router.post("/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.json({ status: "SUCCESS" });
  }

  res.status(400).json({ message: "Payment verification failed" });
});

module.exports = router;
