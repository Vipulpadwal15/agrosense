// src/pages/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-main">
          <div className="hero-badge">
            <span className="hero-dot" />
            AI for everyday farming
          </div>
          <h1 className="hero-title">
            Quiet intelligence
            <br />
            <span>for your fields.</span>
          </h1>
          <p className="hero-subtitle">
            Scan leaves, understand diseases and estimate yield — in one calm
            workspace that works on any device.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn primary">
              Get started free
            </Link>
            <Link to="/login" className="btn ghost">
              I already use AgroSense
            </Link>
          </div>
          <div className="hero-footnote">
            No extra hardware. Just your phone camera and basic field data.
          </div>
        </div>

        <div className="hero-sidecard">
          <div className="sidecard sidecard-glass">
            <p className="sidecard-label">Live snapshot</p>
            <h2 className="sidecard-value">Kharif season 2025</h2>
            <ul className="sidecard-list">
              <li>
                <span className="pill pill-soft-green" />
                3 fields scanned today
              </li>
              <li>
                <span className="pill pill-soft-amber" />
                1 early disease warning
              </li>
              <li>
                <span className="pill pill-soft-blue" />
                Yield outlook: stable
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
