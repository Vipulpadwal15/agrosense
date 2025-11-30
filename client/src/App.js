import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ScanCrop from "./pages/ScanCrop";
import YieldPredict from "./pages/YieldPredict";
import Navbar from "./components/Navbar";
import { setAuthToken } from "./api";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanCrop />} />
            <Route path="/yield" element={<YieldPredict />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
