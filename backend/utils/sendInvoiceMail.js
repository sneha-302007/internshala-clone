const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvoiceEmail = async ({
  to,
  name,
  plan,
  amount,
  startDate,
  endDate,
  paymentId,
}) => {
  const invoiceId = `INV-${Date.now()}`;

  const formattedStart = new Date(startDate).toLocaleDateString("en-IN");
  const formattedEnd = new Date(endDate).toLocaleDateString("en-IN");

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #2563eb;">Payment Successful 🎉</h2>
      
      <p>Hi ${name || "User"},</p>
      
      <p>Thank you for upgrading your subscription. Here are your invoice details:</p>

      <hr/>

      <h3>Invoice Details</h3>
      <p><strong>Invoice ID:</strong> ${invoiceId}</p>
      <p><strong>Payment ID:</strong> ${paymentId}</p>
      <p><strong>Plan:</strong> ${plan}</p>
      <p><strong>Amount Paid:</strong> ₹${amount}</p>
      <p><strong>Start Date:</strong> ${formattedStart}</p>
      <p><strong>Expiry Date:</strong> ${formattedEnd}</p>

      <hr/>

      <p>Your plan is now active. Enjoy applying for internships!</p>

      <br/>
      <p>Regards,</p>
      <p><strong>Intern App Team</strong></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Intern App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice for ${plan} Plan - Intern App`,
    html,
  });
  return invoiceId; // 🔥 important
};

module.exports = sendInvoiceEmail;
