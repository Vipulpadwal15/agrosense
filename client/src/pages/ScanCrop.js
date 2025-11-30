// src/pages/ScanCrop.js
import React, { useState } from "react";
import { api } from "../api";
import { Navigate } from "react-router-dom";

function ScanCrop() {
  const [image, setImage] = useState(null);
  const [cropType, setCropType] = useState("Tomato");
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setError("");
    setResult(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
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
      formData.append("cropType", cropType);

      const res = await api.post("/crop/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.response?.data?.message || "Could not analyze this image.");
    } finally {
      setLoading(false);
    }
  };

  const primary = result?.primary_prediction;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Scan crop</h1>
          <p className="page-subtitle">
            A two–step flow to check leaf health and get simple actions.
          </p>
        </div>
      </div>

      <div className="layout-two">
        {/* Left: form */}
        <form className="panel" onSubmit={handleSubmit}>
          <p className="panel-label">1 · Select crop & image</p>

          <label className="field">
            <span>Crop</span>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
            >
              <option>Tomato</option>
              <option>Potato</option>
              <option>Wheat</option>
              <option>Rice</option>
              <option>Cotton</option>
              <option>Soybean</option>
            </select>
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

          <button className="btn primary full-width" type="submit" disabled={loading}>
            {loading ? "Analyzing…" : "Run scan"}
          </button>
        </form>

        {/* Right: result */}
        <div className="panel">
          <p className="panel-label">2 · Result</p>
          {!result && (
            <p className="panel-caption">
              Once you upload an image and run the scan, results will appear
              here. Try to capture a single leaf in good light.
            </p>
          )}

          {primary && (
            <>
              <div className="result-header">
                <span className="result-title">{primary.disease}</span>
                <span
                  className={
                    primary.severity === "high"
                      ? "badge badge-red"
                      : primary.severity === "medium"
                      ? "badge badge-amber"
                      : "badge badge-green"
                  }
                >
                  {primary.severity || "unknown"} risk
                </span>
              </div>
              <p className="panel-caption">
                Confidence:{" "}
                {Math.round((primary.confidence || 0) * 100)}
                % · Crop: {cropType}
              </p>

              {result.advice && (
                <>
                  <p className="panel-label mt-md">Suggested steps</p>
                  <ul className="list">
                    {result.advice.steps?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                  {result.advice.yield_impact && (
                    <p className="panel-caption mt-sm">
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
