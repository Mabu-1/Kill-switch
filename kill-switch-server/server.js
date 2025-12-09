const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Allow Dashboard and Shopify to talk to server
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// 2. Define the Schema (Structure)
const storeSchema = new mongoose.Schema({
  clientName: String,  // New field
  storeName: String,
  siteKey: String,     // Auto-generated
  message: String,
  status: { type: String, default: "ON" }
});

const Store = mongoose.model("Store", storeSchema);

// Helper: Generate Random Key (8 chars)
const generateKey = () => Math.random().toString(36).substring(2, 10);

// --- ROUTES ---

// A. Get all data (For Dashboard Admin)
app.get("/stores", async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. Add new client (For Dashboard Admin)
app.post("/add_store", async (req, res) => {
  try {
    const { clientName, storeName, message } = req.body;
    
    // Auto-generate the unique key here
    const siteKey = generateKey();
    
    const newStore = new Store({ 
      clientName, 
      storeName, 
      message, 
      siteKey 
    });
    
    await newStore.save();
    res.json(newStore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. Toggle Status (For Dashboard Admin)
app.post("/toggle_status", async (req, res) => {
  try {
    const { key, status } = req.body;
    const store = await Store.findOne({ siteKey: key });
    if (!store) return res.status(404).json({ error: "Store not found" });
    
    store.status = status;
    await store.save();
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// D. PUBLIC Check Status (For Shopify Store Script)
app.get("/check_status/:siteKey", async (req, res) => {
  try {
    const store = await Store.findOne({ siteKey: req.params.siteKey });
    
    // If invalid key, pretend everything is fine (don't break their site)
    if (!store) return res.json({ status: "ON" });

    // Only send public info
    res.json({ 
      status: store.status, 
      message: store.message 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // <--- ADD THIS LINE FOR VERCEL!