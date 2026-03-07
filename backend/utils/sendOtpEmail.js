const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

const sendOtpEmail = async (to, otp, purpose = "login") => {
  let subject = "OTP Verification";
  let html = "";

  switch (purpose) {
    case "login":
      subject = "Login OTP Verification";
      html = `
        <h2>Login Verification</h2>
        <p>Your login OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not try to log in, please ignore this email.</p>
      `;
      break;

    case "resume":
      subject = "Resume Generation OTP";
      html = `
        <h2>Resume Verification</h2>
        <p>Use the OTP below to verify resume generation:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `;
      break;

    case "french":
      subject = "Language Change Verification (French)";
      html = `
    <h2>French Language Activation</h2>
    <p>Use this OTP to enable French language:</p>
    <h1>${otp}</h1>
    <p>This OTP is valid for 5 minutes.</p>
  `;
      break;

    default:
      html = `
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
      `;
  }

  await transporter.sendMail({
    from: `"Intern App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendOtpEmail;
