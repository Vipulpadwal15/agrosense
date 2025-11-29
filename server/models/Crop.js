const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    field: { type: mongoose.Schema.Types.ObjectId, ref: "Field", required: true },
    cropType: { type: String, required: true },
    variety: String,
    sowingDate: Date,
    irrigation: String,
    seasonYear: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
