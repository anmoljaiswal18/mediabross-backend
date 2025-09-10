const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// POST /api/contact
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Email to YOU
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#f4f4f4;">
          <h2 style="color:#2c3e50;">🚀 New Client Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="padding:10px; background:#fff; border-radius:5px; border:1px solid #ddd;">
            ${message}
          </div>
          <br/>
          <p style="color:#555;">⚡ This message was sent from your Mediabross contact form.</p>
        </div>
      `,
    });

    // Auto-reply to client
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🎉 Thanks for contacting Mediabross!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#fdfdfd; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color:#27ae60;">🙏 Thank You, ${name}!</h2>
          <p style="font-size:16px; color:#333;">
            We have received your message and our team will get back to you shortly.  
          </p>
          <p style="color:#555;">
            Here’s a copy of your message:
          </p>
          <blockquote style="border-left: 4px solid #27ae60; padding-left: 10px; color:#444; margin:10px 0;">
            ${message}
          </blockquote>
          <p style="font-size:14px; color:#888;">
            🌍 Stay connected with us on <a href="https://mediabross.com" style="color:#27ae60;">mediabross.com</a>
          </p>
          <hr/>
          <p style="font-size:12px; color:#aaa;">This is an automated response. Please don’t reply.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: "✅ Email sent successfully!" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
