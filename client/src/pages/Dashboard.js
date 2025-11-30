// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Navigate, useNavigate } from "react-router-dom";

function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOverview() {
      try {
        if (!token) return;
        const res = await api.get("/dashboard/overview");
        setOverview(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, [token]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="panel center">
          <p>Collecting your field data…</p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="page">
        <div className="panel center">
          <p>We couldn’t load your dashboard right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of active fields, disease risk and expected yield.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn ghost small"
            onClick={() => navigate("/scan")}
          >
            Scan leaf
          </button>
          <button
            className="btn primary small"
            onClick={() => navigate("/yield")}
          >
            Predict yield
          </button>
        </div>
      </div>

      {/* Top stats row */}
      <div className="grid-3">
        <div className="panel stat-card">
          <p className="panel-label">Active fields</p>
          <h2 className="panel-value">
            {overview.fieldCount != null ? overview.fieldCount : 0}
          </h2>
          <p className="panel-caption">
            Crops monitored: {overview.activeCrops || 0}
          </p>
        </div>

        <div className="panel stat-card">
          <p className="panel-label">Disease signals</p>
          <h2 className="panel-value">
            {overview.diseaseCases != null ? overview.diseaseCases : 0}
          </h2>
          <p className="panel-caption">
            High risk crops:{" "}
            <span className="badge badge-amber">
              {overview.highRiskCrops || 0}
            </span>
          </p>
        </div>

        <div className="panel stat-card">
          <p className="panel-label">Expected yield</p>
          <h2 className="panel-value">
            {overview.totalExpectedYield || 0} qtl
          </h2>
          <p className="panel-caption">
            Last prediction: {overview.lastPredictionDate || "—"}
          </p>
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid-3 mt-lg">
        <button
          className="panel quick-card"
          onClick={() => navigate("/scan")}
        >
          <div className="quick-icon quick-icon-green">📷</div>
          <div>
            <p className="quick-title">Scan crop health</p>
            <p className="quick-subtitle">
              Upload a leaf photo to detect early disease signs.
            </p>
          </div>
        </button>

        <button
          className="panel quick-card"
          onClick={() => navigate("/yield")}
        >
          <div className="quick-icon quick-icon-blue">📊</div>
          <div>
            <p className="quick-title">Predict yield</p>
            <p className="quick-subtitle">
              Enter basic field details to estimate seasonal output.
            </p>
          </div>
        </button>

        <div className="panel quick-card muted">
          <div className="quick-icon quick-icon-neutral">🧠</div>
          <div>
            <p className="quick-title">Model insights</p>
            <p className="quick-subtitle">
              Once models are trained, this will summarise AI performance.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts section */}
      <div className="panel mt-lg">
        <p className="panel-label">Field alerts</p>
        {overview.alerts && overview.alerts.length > 0 ? (
          <ul className="list list-tight">
            {overview.alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        ) : (
          <p className="panel-caption">
            No critical alerts. Keep logging scans to stay ahead of disease.
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
