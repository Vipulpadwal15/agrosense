const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Models
const User = require("./models/User");
const Field = require("./models/Field");
const Crop = require("./models/Crop");
const DiseaseCase = require("./models/DiseaseCase");
const YieldPrediction = require("./models/YieldPrediction");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/crop", require("./routes/crop"));
app.use("/api/yield", require("./routes/yield"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.get("/", (req, res) => {
  res.send("AgroSense API running");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
