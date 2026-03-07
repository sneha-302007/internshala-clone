const express = require("express");
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const User = require("../Model/User");
const sendInvoiceEmail = require("../utils/sendInvoiceMail");
const Transaction = require("../Model/Transaction");

const router = express.Router();

// Plan configuration
const PLAN_DETAILS = {
  BRONZE: { price: 100, limit: 3 },
  SILVER: { price: 300, limit: 5 },
  GOLD: { price: 1000, limit: Infinity },
};

// ⏰ Allow payment only between 10–11 AM IST
function isWithinPaymentTime() {
  console.log("TIME CHECK BYPASSED");
  const now = new Date();
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const hour = ist.getHours();
  return hour >= 10 && hour < 11;
  return true;
}

router.post("/create-order", async (req, res) => {
  console.log("CREATE ORDER HIT");

  // 🔒 Block if plan still active
  const dbUser = await User.findOne({ uid: req.body.uid });

  if (
    dbUser?.subscription?.endDate &&
    new Date() < new Date(dbUser.subscription.endDate)
  ) {
    return res.status(400).json({
      code: "PLAN_ACTIVE",
    });
  }
  try {
    if (!isWithinPaymentTime()) {
      return res.status(403).json({
         code: "UPGRADE_TIME_RESTRICTED",
      });
    }

    const { plan } = req.body;

    if (!PLAN_DETAILS[plan]) {
      return res.status(400).json({ code: "INVALID_PLAN", });
    }

    const amount = PLAN_DETAILS[plan].price * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `sub_${plan}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Subscription Order Error:", err);
    res.status(500).json({  code: "CREATE_ORDER_FAILED", });
  }
});

router.post("/verify", async (req, res) => {
  console.log("VERIFY ROUTE HIT");
  console.log("BODY:", req.body);
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      uid,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ code: "PAYMENT_VERIFICATION_FAILED" });
    }

    const planData = PLAN_DETAILS[plan];

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const updatedUser = await User.findOneAndUpdate(
      { uid: uid },
      {
        $set: {
          plan: plan,
          maxApplications: planData.limit === Infinity ? 9999 : planData.limit,

          subscription: {
            plan: plan,
            applicationsUsed: 0,
            applicationLimit: planData.limit,
            startDate: startDate,
            endDate: endDate,
          },
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({code: "USER_NOT_FOUND"});
    }

    console.log("UPDATED USER:", updatedUser);
    // ✅ Send Invoice Email AFTER successful update
    const invoiceId = await sendInvoiceEmail({
      to: updatedUser.email,
      name: updatedUser.name,
      plan: plan,
      amount: planData.price,
      startDate: startDate,
      endDate: endDate,
      paymentId: razorpay_payment_id,
    });
  
    await Transaction.create({
      userId: updatedUser._id, // Mongo ObjectId
      uid: uid, // Firebase UID
      plan: plan,
      amount: planData.price,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      invoiceId: invoiceId,
      startDate: startDate,
      endDate: endDate,
      status: "SUCCESS",
    });

    res.json({
      status: "SUCCESS",
      invoiceSent: true,
    });
  } catch (err) {
    console.error("Subscription Verify Error:", err);
    res.status(500).json({ code: "SUBSCRIPTION_VERIFICATION_FAILED" });
  }
});

module.exports = router;
