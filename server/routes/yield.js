const express = require("express");
const axios = require("axios");
const auth = require("../middleware/auth");
const YieldPrediction = require("../models/YieldPrediction");

const router = express.Router();

router.post("/predict", auth, async (req, res) => {
  try {
    const mlUrl = `${process.env.ML_SERVICE_URL}/ml/yield`;
    const mlRes = await axios.post(mlUrl, req.body);
    const data = mlRes.data;

    await YieldPrediction.create({
      user: req.user.id,
      cropType: req.body.cropType,
      soilType: req.body.soilType,
      areaAcres: req.body.areaAcres,
      sowingDate: req.body.sowingDate,
      irrigation: req.body.irrigation,
      expectedYieldPerAcre: data.expected_yield_per_acre,
      minYield: data.min_yield,
      maxYield: data.max_yield,
      confidence: data.confidence,
      notes: data.notes,
    });

    res.json(data);
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ message: "Yield prediction failed" });
  }
});

module.exports = router;
