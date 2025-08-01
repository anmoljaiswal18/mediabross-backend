const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Static file serving (optional)
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));

// Serve index.html (optional frontend testing)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Contact Schema & Model with timestamps
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true }); // ✅ Enables createdAt & updatedAt

const Contact = mongoose.model("Contact", contactSchema);

// POST route to save contact form submission
app.post("/contact", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send("✅ Message saved successfully!");
  } catch (error) {
    console.error("❌ Error saving message:", error);
    res.status(500).send("Error saving message");
  }
});

// ✅ GET route to fetch contacts with optional date filtering
app.get("/contacts", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    res.status(500).send("Error fetching contacts");
  }
});

// Optional: Serve contacts HTML page for viewing messages
app.get("/contacts-view", (req, res) => {
  res.sendFile(path.join(__dirname, "contacts.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
