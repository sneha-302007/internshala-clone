const axios = require("axios");

const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

const TEMPLATE_ID = "template_q8dx3ba"; // paste OTP template id here

const sendOtpEmail = async (to, otp, purpose = "login") => {

  let subject = "OTP Verification";
  let title = "Verification";
  let message = "";
  let footer = "";

  switch (purpose) {
    case "login":
      subject = "Login OTP Verification";
      title = "Login Verification";
      message = "Your login OTP is:";
      footer = "If you did not try to log in, please ignore this email.";
      break;

    case "resume":
      subject = "Resume Generation OTP";
      title = "Resume Verification";
      message = "Use the OTP below to verify resume generation:";
      break;

    case "french":
      subject = "Language Change Verification (French)";
      title = "French Language Activation";
      message = "Use this OTP to enable French language:";
      break;

    default:
      message = "Your OTP is:";
  }

  try {
    await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
      service_id: SERVICE_ID,
      template_id: TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,  
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        email: to,
        subject,
        title,
        message,
        footer,
        otp
      }
    });

    console.log("OTP email sent to:", to);

  } catch (error) {
    console.error("Email sending failed:", error.response?.data || error);
    throw error;
  }
};

module.exports = sendOtpEmail;