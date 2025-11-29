const FormData = require("form-data");
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const auth = require("../middleware/auth");
const DiseaseCase = require("../models/DiseaseCase");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/scan", auth, upload.single("image"), async (req, res) => {
  try {
    const { cropType } = req.body;
    const filePath = req.file.path;

    const mlUrl = `${process.env.ML_SERVICE_URL}/ml/disease`;

    const formData = new FormData();
    const fs = require("fs");
    const path = require("path");
    const fileStream = fs.createReadStream(path.resolve(filePath));
    formData.append("file", fileStream);
    formData.append("crop_type", cropType);

    const mlRes = await axios.post(mlUrl, formData, {
      headers: formData.getHeaders(),
    });

    const data = mlRes.data;

    // Save disease case (basic)
    await DiseaseCase.create({
      user: req.user.id,
      cropType,
      predictedDisease: data.primary_prediction?.disease,
      altDisease: data.secondary_prediction?.disease,
      confidence: data.primary_prediction?.confidence,
      severity: data.primary_prediction?.severity,
      adviceText: data.advice?.steps?.join(" "),
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Crop scan failed" });
  }
});

module.exports = router;
