const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving (optional)
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));

// Serve index.html (optional frontend testing)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 📧 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // from .env
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// 📩 Contact form route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Send email to YOU
    await transporter.sendMail({
      from: email,
      to: "mediabross.cc@gmail.com", // your email
      subject: "New Client Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    // Auto-reply to CLIENT
    await transporter.sendMail({
      from: "mediabross.cc@gmail.com",
      to: email,
      subject: "Thanks for contacting us!",
      text: `Hello ${name},\n\nThanks for contacting us. We will get back to you shortly.\n\n- Team Mediabross`,
    });

    res.status(200).send({ success: true, message: "✅ Email sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).send({ success: false, message: "❌ Error sending email" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
