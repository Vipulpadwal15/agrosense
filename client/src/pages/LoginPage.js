import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuthToken } from "../api";

function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { phone, password });
      const { token } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid phone or password");
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-panel">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to monitor your fields.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Phone</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button className="btn primary full-width" type="submit">
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          New to AgroSense? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
