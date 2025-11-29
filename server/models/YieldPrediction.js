const mongoose = require("mongoose");

const yieldPredictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cropType: String,
    soilType: String,
    areaAcres: Number,
    sowingDate: Date,
    irrigation: String,
    expectedYieldPerAcre: Number,
    minYield: Number,
    maxYield: Number,
    confidence: String,
    notes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("YieldPrediction", yieldPredictionSchema);
