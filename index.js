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

// Contact Schema & Model
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});
const Contact = mongoose.model("Contact", contactSchema);

// Contact form route
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
