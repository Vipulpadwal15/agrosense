const mongoose = require("mongoose");

const diseaseCaseSchema = new mongoose.Schema(
  {
    crop: { type: mongoose.Schema.Types.ObjectId, ref: "Crop" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imageUrl: String,
    cropType: String,
    predictedDisease: String,
    altDisease: String,
    confidence: Number,
    severity: String,
    adviceText: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiseaseCase", diseaseCaseSchema);
