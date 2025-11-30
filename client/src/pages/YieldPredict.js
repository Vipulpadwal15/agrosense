// src/pages/YieldPredict.js
import React, { useState } from "react";
import { api } from "../api";
import { Navigate } from "react-router-dom";

function YieldPredict() {
  const [form, setForm] = useState({
    cropType: "Wheat",
    soilType: "Black",
    areaAcres: 1,
    sowingDate: "",
    irrigation: "Rainfed",
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
      const res = await api.post("/yield/predict", form);
      setResult(res.data);
    } catch (err) {
      console.error("Yield error:", err);
      setError(err.response?.data?.message || "Prediction failed");
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
            Simple inputs, quick estimate of expected output.
          </p>
        </div>
      </div>

      <div className="layout-two">
        {/* Left: form */}
        <form className="panel" onSubmit={handleSubmit}>
          <p className="panel-label">Field details</p>

          <label className="field">
            <span>Crop</span>
            <select
              name="cropType"
              value={form.cropType}
              onChange={handleChange}
            >
              <option>Wheat</option>
              <option>Rice</option>
              <option>Cotton</option>
              <option>Soybean</option>
              <option>Tomato</option>
              <option>Potato</option>
            </select>
          </label>

          <div className="field-row">
            <label className="field">
              <span>Soil</span>
              <select
                name="soilType"
                value={form.soilType}
                onChange={handleChange}
              >
                <option>Black</option>
                <option>Red</option>
                <option>Sandy</option>
                <option>Loamy</option>
              </select>
            </label>
            <label className="field">
              <span>Area (acres)</span>
              <input
                type="number"
                name="areaAcres"
                value={form.areaAcres}
                min="0.1"
                step="0.1"
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>Sowing date</span>
              <input
                type="date"
                name="sowingDate"
                value={form.sowingDate}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              <span>Irrigation</span>
              <select
                name="irrigation"
                value={form.irrigation}
                onChange={handleChange}
              >
                <option>Rainfed</option>
                <option>Canal</option>
                <option>Borewell</option>
                <option>Drip</option>
              </select>
            </label>
          </div>

          {error && <p className="field-error">{error}</p>}

          <button className="btn primary full-width" type="submit" disabled={loading}>
            {loading ? "Predicting…" : "Predict yield"}
          </button>
        </form>

        {/* Right: result */}
        <div className="panel">
          <p className="panel-label">Prediction</p>

          {!result && (
            <p className="panel-caption">
              After submitting the form, an estimated yield range and confidence
              will appear here.
            </p>
          )}

          {result && (
            <>
              <div className="result-header">
                <span className="result-title">
                  {result.expected_yield_per_acre} qtl / acre
                </span>
                <span className="badge badge-green">
                  {result.confidence || "model run"}
                </span>
              </div>
              <p className="panel-caption">
                Range: {result.min_yield} – {result.max_yield} qtl / acre
              </p>

              {result.notes && (
                <>
                  <p className="panel-label mt-md">Notes</p>
                  <ul className="list">
                    {result.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default YieldPredict;
