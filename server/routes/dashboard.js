const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Field = require("../models/Field");
const Crop = require("../models/Crop");
const DiseaseCase = require("../models/DiseaseCase");
const YieldPrediction = require("../models/YieldPrediction");

const router = express.Router();

router.get("/overview", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const fieldCount = await Field.countDocuments({ user: user._id });
    const diseaseCases = await DiseaseCase.countDocuments({ user: user._id });
    const lastYield = await YieldPrediction.findOne({ user: user._id }).sort({
      createdAt: -1,
    });

    const totalExpected = await YieldPrediction.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: "$expectedYieldPerAcre" },
        },
      },
    ]);

    const totalExpectedYield = totalExpected[0]?.total || 0;

    const overview = {
      user: { name: user.name },
      fieldCount,
      activeCrops: 0, // can expand later with Crop collection
      diseaseCases,
      highRiskCrops: 0, // reserved for more complex logic
      totalExpectedYield,
      lastPredictionDate: lastYield
        ? lastYield.createdAt.toISOString().split("T")[0]
        : null,
      alerts: [], // fill with weather/disease logic later
    };

    res.json(overview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

module.exports = router;
