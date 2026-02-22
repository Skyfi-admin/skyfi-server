// ===== SkyFi ISP Server =====

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ===== MongoDB Connect =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Error:", err.message));

// ===== Customer Schema =====
const customerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  plan: { type: String, required: true },
  usage: { type: Number, default: 0 },
  limit: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
}, { strict: false });

const Customer = mongoose.model("Customer", customerSchema);

// ===== Root Test =====
app.get("/", (req, res) => {
  res.send("SkyFi Server Running 🚀");
});

// ===== Get All Customers =====
app.get("/customers", async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

// ===== Customer Login =====
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Customer.findOne({ username, password });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user,
  });
});

// ===== Add Customer =====
app.post("/addCustomer", async (req, res) => {
  try {
    const newCustomer = new Customer({
      username: req.body.username,
      password: req.body.password,
      plan: req.body.plan,
      usage: req.body.usage,
      limit: req.body.limit,
      status: req.body.status,
    });

    const savedCustomer = await newCustomer.save();

    res.json({
      message: "Customer added",
      customer: savedCustomer,
    });
  } catch (err) {
    console.error("Add customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Reset Usage =====
app.post("/resetUsage/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  customer.usage = 0;
  await customer.save();

  res.json({ message: "Usage reset", customer });
});

// ===== Delete Customer =====
app.delete("/deleteCustomer/:id", async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer deleted" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
