const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 1. AGGRESSIVE CORS SETUP (Allows Shopify to connect)
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2. ROBUST DATABASE CONNECTION
// We add options to make it connect faster or fail cleanly
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Fail after 5 seconds instead of hanging
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB Connection Error:", err));

// Define Schema
const storeSchema = new mongoose.Schema({
  clientName: String,
  storeName: String,
  siteKey: String,
  message: String,
  status: { type: String, default: "ON" }
});
const Store = mongoose.model("Store", storeSchema);

const generateKey = () => Math.random().toString(36).substring(2, 10);

// --- ROUTES ---

// Test Route (To check if server is alive)
app.get("/", (req, res) => {
  res.send("Kill Switch Server is Alive!");
});

app.get("/stores", async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/add_store", async (req, res) => {
  try {
    const { clientName, storeName, message } = req.body;
    const siteKey = generateKey();
    const newStore = new Store({ clientName, storeName, message, siteKey });
    await newStore.save();
    res.json(newStore);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// PUBLIC Check Status
app.get("/check_status/:siteKey", async (req, res) => {
  try {
    const store = await Store.findOne({ siteKey: req.params.siteKey });
    
    // If invalid key, return ON so we don't break the site
    if (!store) return res.json({ status: "ON" });

    res.json({ 
      status: store.status, 
      message: store.message 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;