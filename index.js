// index.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});


// ✅ Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Mediabross backend" });
});

// ✅ Contact route
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing fields." });
  }

  // 👉 Respond immediately so frontend never times out
  res.status(202).json({ success: true, message: "Accepted — processing in background" });

  // Background task: send emails AFTER responding
  (async () => {
    try {
      // Email to you
      await transporter.sendMail({
        from: email,
        to: process.env.EMAIL_USER,
        subject: `📩 New Contact from ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p>${message}</p>`,
      });

      // Auto-reply to client
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🎉 Thanks for contacting Mediabross!",
        html: `<p>Hi ${name}, we got your message and will reply soon.</p>`,
      });

      console.log(`✉️ Emails sent successfully for ${email}`);
    } catch (err) {
      console.error("❌ Email send failed:", err.message || err);
    }
  })();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
