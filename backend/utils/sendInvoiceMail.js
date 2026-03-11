const axios = require("axios");

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

// paste your EmailJS invoice template id here
const TEMPLATE_ID = "template_853t4im";

const sendInvoiceMail = async ({
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

  try {
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: PUBLIC_KEY,
      template_params: {
        email: to,
        name: name || "User",
        plan: plan,
        amount: amount,
        payment_id: paymentId,
        invoice_id: invoiceId,
        start_date: formattedStart,
        end_date: formattedEnd,
      },
    });

    console.log("Invoice email sent to:", to);

    return invoiceId; // important for storing invoice id
  } catch (error) {
    console.error(
      "Invoice email sending failed:",
      error.response?.data || error
    );
    throw error;
  }
};

module.exports = sendInvoiceMail;