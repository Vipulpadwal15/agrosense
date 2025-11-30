import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuthToken } from "../api";

function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", {
        name,
        phone,
        village,
        district,
        state: stateName,
        password,
      });
      const { token } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-panel">
        <h2 className="auth-title">Create your farm profile</h2>
        <p className="auth-subtitle">A simple workspace for your crops.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label className="field">
            <span>Village</span>
            <input value={village} onChange={(e) => setVillage(e.target.value)} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>District</span>
              <input value={district} onChange={(e) => setDistrict(e.target.value)} />
            </label>
            <label className="field">
              <span>State</span>
              <input value={stateName} onChange={(e) => setStateName(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="field-error">{error}</p>}

          <button className="btn primary full-width" type="submit">
            Create account
          </button>
        </form>

        <p className="auth-footer">
          Already using AgroSense? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
