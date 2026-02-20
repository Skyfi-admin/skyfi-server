// ===== SkyFi ISP Server =====

const express = require("express");
const cors = require("cors");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Root Test =====
app.get("/", (req, res) => {
  res.send("SkyFi Server Running 🚀");
});

// ===== Sample In-Memory Data (temporary) =====
let customers = [
  {
    id: 1,
    username: "testuser",
    password: "1234",
    plan: "30 Mbps",
    usage: 50,
    limit: 200,
    status: "Active",
  },
];

// ===== Get All Customers =====
app.get("/customers", (req, res) => {
  res.json(customers);
});

// ===== Customer Login =====
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = customers.find(
    (c) => c.username === username && c.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user,
  });
});

// ===== Add Customer =====
app.post("/addCustomer", (req, res) => {
  const newCustomer = {
    id: customers.length + 1,
    ...req.body,
  };

  customers.push(newCustomer);
  res.json({ message: "Customer added", customer: newCustomer });
});

// ===== Reset Usage =====
app.post("/resetUsage/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const customer = customers.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ message: "Customer not found" });
  }

  customer.usage = 0;
  res.json({ message: "Usage reset", customer });
});

// ===== Delete Customer =====
app.delete("/deleteCustomer/:id", (req, res) => {
  const id = parseInt(req.params.id);

  customers = customers.filter((c) => c.id !== id);
  res.json({ message: "Customer deleted" });
});

// ===== Server Start =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SkyFi Server running on port ${PORT}`);
});
