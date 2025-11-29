const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "Main Field" },
    areaAcres: { type: Number, default: 1 },
    soilType: { type: String, default: "Unknown" },
    location: {
      lat: Number,
      lon: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Field", fieldSchema);
