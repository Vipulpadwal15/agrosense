// src/pages/YieldPredict.js
import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const ML_BASE_URL =
  process.env.REACT_APP_ML_SERVICE_URL || "http://127.0.0.1:8001";

function YieldPredict() {
  const [form, setForm] = useState({
    Area: "",
    Annual_Rainfall: "",
    Fertilizer: "",
    Pesticide: "",
    Crop: "Wheat",
    Season: "Kharif",
    State: "Maharashtra",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        Area: Number(form.Area),
        Annual_Rainfall: Number(form.Annual_Rainfall),
        Fertilizer: Number(form.Fertilizer),
        Pesticide: Number(form.Pesticide),
        Crop: form.Crop,
        Season: form.Season,
        State: form.State,
      };

      const res = await fetch(`${ML_BASE_URL}/predict-yield`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Prediction failed");
      }

      const data = await res.json(); // { predicted_yield, unit }

      const predicted = Number(data.predicted_yield || 0);
      const min = predicted * 0.9;
      const max = predicted * 1.1;

      setResult({
        predicted,
        min,
        max,
        unit: data.unit || "yield (dataset unit)",
      });
    } catch (err) {
      console.error("Yield error:", err);
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Yield prediction</h1>
          <p className="page-subtitle">
            Enter agronomic parameters directly used by the yield model.
          </p>
        </div>
      </div>

      <div className="layout-two">
        {/* Left: form */}
        <form className="panel" onSubmit={handleSubmit}>
          <p className="panel-label">Field details (model inputs)</p>

          <div className="field-row">
            <label className="field">
              <span>Area</span>
              <input
                type="number"
                name="Area"
                value={form.Area}
                min="0.1"
                step="0.1"
                onChange={handleChange}
                placeholder="e.g. 1.0"
                required
              />
              <small className="field-hint">
                Use same unit as dataset (e.g. hectares)
              </small>
            </label>
            <label className="field">
              <span>Annual Rainfall (mm)</span>
              <input
                type="number"
                name="Annual_Rainfall"
                value={form.Annual_Rainfall}
                min="0"
                step="1"
                onChange={handleChange}
                placeholder="e.g. 900"
                required
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Fertilizer (kg/ha)</span>
              <input
                type="number"
                name="Fertilizer"
                value={form.Fertilizer}
                min="0"
                step="1"
                onChange={handleChange}
                placeholder="e.g. 120"
                required
              />
            </label>
            <label className="field">
              <span>Pesticide (kg/ha)</span>
              <input
                type="number"
                name="Pesticide"
                value={form.Pesticide}
                min="0"
                step="1"
                onChange={handleChange}
                placeholder="e.g. 20"
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Crop</span>
            <select name="Crop" value={form.Crop} onChange={handleChange}>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Maize">Maize</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Cotton">Cotton</option>
              <option value="Soybean">Soybean</option>
              {/* add crops exactly as in dataset */}
            </select>
          </label>

          <div className="field-row">
            <label className="field">
              <span>Season</span>
              <select
                name="Season"
                value={form.Season}
                onChange={handleChange}
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Whole Year">Whole Year</option>
                {/* match with dataset values exactly */}
              </select>
            </label>
            <label className="field">
              <span>State</span>
              <input
                type="text"
                name="State"
                value={form.State}
                onChange={handleChange}
                placeholder="e.g. Maharashtra"
                required
              />
            </label>
          </div>

          {error && <p className="field-error">{error}</p>}

          <button
            className="btn primary full-width"
            type="submit"
            disabled={loading}
          >
            {loading ? "Predicting…" : "Predict yield"}
          </button>
        </form>

        {/* Right: result */}
        <div className="panel">
          <p className="panel-label">Prediction</p>

          {!result && (
            <p className="panel-caption">
              After submitting the form, the model’s predicted yield and an
              estimated range will appear here.
            </p>
          )}

          {result && (
            <>
              <div className="result-header">
                <span className="result-title">
                  {result.predicted.toFixed(2)} {result.unit}
                </span>
                <span className="badge badge-green">model estimate</span>
              </div>
              <p className="panel-caption">
                Range: {result.min.toFixed(2)} – {result.max.toFixed(2)}{" "}
                {result.unit}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default YieldPredict;
