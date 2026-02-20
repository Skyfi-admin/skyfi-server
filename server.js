const CustomerSchema = new mongoose.Schema({
  username: String,
  password: String,
  plan: String,
  usage: { type: Number, default: 0 }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Customer.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login success",
      customer: user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const Customer = mongoose.model("Customer", CustomerSchema);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URL = process.env.MONGO_URL;

// MongoDB connect
mongoose.connect(MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("SkyFi Server Running 🚀");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
