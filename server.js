const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/* ===============================
   🔗 MongoDB Connection
=============================== */

const MONGO_URL = process.env.MONGO_URL || "YOUR_MONGODB_URL_HERE";

mongoose.connect(MONGO_URL)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));


/* ===============================
   👤 Customer Schema
=============================== */

const customerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  usage: {
    type: Number,
    default: 0
  },
  limit: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active"
  }
}, { timestamps: true });

/* 🔐 Auto hash password */
customerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Customer = mongoose.model("Customer", customerSchema);


/* ===============================
   🚀 Routes
=============================== */

/* ✅ Health check */
app.get("/", (req, res) => {
  res.send("🚀 SkyFi Server Running");
});


/* ✅ Add Customer */
app.post("/addCustomer", async (req, res) => {
  try {
    const { username, password, plan, limit } = req.body;

    const customer = new Customer({
      username,
      password, // ✅ DO NOT HASH HERE
      plan,
      limit
    });

    await customer.save();

    res.json({ message: "✅ Customer added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ✅ Customer Login */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const customer = await Customer.findOne({ username });
    if (!customer) {
      return res.status(401).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, customer.password);
    if (!match) {
      return res.status(401).json({ message: "Wrong password" });
    }

    res.json({
      message: "✅ Login success",
      customer
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ✅ Get All Customers (Admin) */
app.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ✅ Reset Usage */
app.post("/resetUsage/:id", async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { usage: 0 });
    res.json({ message: "✅ Usage reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ✅ Delete Customer */
app.delete("/deleteCustomer/:id", async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ===============================
   🌐 Start Server
=============================== */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
