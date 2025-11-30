// src/pages/ScanCrop.js
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const SUPPORTED_CROPS = [
  "Apple",
  "Blueberry",
  "Cherry",
  "Corn",
  "Grape",
  "Orange",
  "Peach",
  "Pepper (bell)",
  "Potato",
  "Raspberry",
  "Soybean",
  "Squash",
  "Strawberry",
  "Tomato",
];

function ScanCrop() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("auto"); // NEW

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setError("");
    setResult(null);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Please select a leaf image first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      // send crop hint (backend can ignore or use later)
      if (selectedCrop !== "auto") {
        formData.append("crop_hint", selectedCrop);
      }

      const res = await fetch("http://localhost:8001/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Prediction failed");
      }

      const data = await res.json();
      console.log("ML result:", data);
      setResult(data);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Could not analyze this image.");
    } finally {
      setLoading(false);
    }
  };

  const primary = result?.primary_prediction;

  const severityBadgeClass = (severity) => {
    if (!severity) return "badge badge-amber";
    const s = severity.toLowerCase();
    if (s === "high") return "badge badge-red";
    if (s === "medium") return "badge badge-amber";
    if (s === "low" || s === "mild") return "badge badge-green";
    return "badge badge-amber";
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan crop</h1>
          <p className="page-subtitle">
            Upload a leaf image and let AgroSense analyze disease risk and give
            simple actions.
          </p>
        </div>
      </div>

      <div className="layout-two">
        {/* LEFT: form */}
        <form className="panel" onSubmit={handleSubmit}>
          <p className="panel-label">1 · Upload leaf image</p>

          {/* NEW: crop selector */}
          <label className="field">
            <span>Crop (optional)</span>
            <select
              className="input"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="auto">Auto detect (recommended)</option>
              {SUPPORTED_CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
            <p className="field-helper">
              Model currently supports:{" "}
              <strong>{SUPPORTED_CROPS.join(", ")}</strong>
            </p>
          </label>

          <label className="field">
            <span>Leaf photo</span>
            <div className="file-drop">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="file-drop-text">
                Drop an image here or <span>browse</span> from your device.
              </p>
            </div>
          </label>

          {previewUrl && (
            <div className="preview-wrapper">
              <p className="panel-label">Preview</p>
              <img src={previewUrl} alt="leaf preview" className="preview-img" />
            </div>
          )}

          {error && <p className="field-error">{error}</p>}

          <button
            className="btn primary full-width"
            type="submit"
            disabled={loading}
          >
            {loading ? "Analyzing…" : "Run scan"}
          </button>
        </form>

        {/* RIGHT: result */}
        <div className="panel">
          <p className="panel-label">2 · Result & advisory</p>

          {!result && (
            <p className="panel-caption">
              After you upload an image and run the scan, the detected disease,
              risk level and suggestions will appear here.
            </p>
          )}

          {primary && (
            <>
              <div className="result-header">
                <span className="result-title">
                  {primary.crop} – {primary.disease}
                </span>
                <span className={severityBadgeClass(primary.severity)}>
                  {primary.severity || "unknown"} risk
                </span>
              </div>

              <p className="panel-caption">
                Confidence:{" "}
                {Math.round((primary.confidence || 0) * 100)}%
              </p>

              {result.top3 && result.top3.length > 0 && (
                <>
                  <p className="panel-label mt-md">Model view (top 3)</p>
                  <ul className="list">
                    {result.top3.map((p, i) => (
                      <li key={i}>
                        {Math.round(p.confidence * 100)}% – {p.crop}{" "}
                        {p.disease} ({p.severity || "risk"})
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {result.advice && (
                <>
                  <p className="panel-label mt-md">What you can do</p>
                  <p className="panel-caption">{result.advice.summary}</p>
                  <ul className="list mt-sm">
                    {result.advice.steps?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                  {result.advice.yield_impact && (
                    <p className="panel-caption mt-sm">
                      <strong>Yield impact:</strong>{" "}
                      {result.advice.yield_impact}
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScanCrop;
