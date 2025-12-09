// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import heartHero from "../assets/heart.svg";
import googleLogo from "../assets/google.png";

const API_BASE_URL = "http://localhost:5000"; // ganti kalau backend beda port/url

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Isi email dan kata sandi.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login gagal. Cek kembali email dan kata sandi.");
        setLoading(false);
        return;
      }

      // simpan token & user di localStorage
      localStorage.setItem("heart_token", data.token);
      localStorage.setItem("heart_user", JSON.stringify(data.user));

      // pindah ke HOME
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Terjadi kesalahan pada server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Masuk dengan Google (dummy).");
    navigate("/home");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* background stripes */}
        <div className="login-stripe login-stripe-1" />
        <div className="login-stripe login-stripe-2" />
        <div className="login-stripe login-stripe-3" />
        <div className="login-stripe login-stripe-4" />
        <div className="login-stripe login-stripe-5" />

        {/* kartu putih */}
        <div className="login-card">
          {/* FORM KIRI */}
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-title">Masuk</h1>
            <p className="login-subtitle">Masuk ke dalam akun anda</p>

            {/* ERROR MESSAGE */}
            {errorMsg && <p className="form-error">{errorMsg}</p>}

            {/* EMAIL */}
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <div className="login-input">
              <input
                id="email"
                type="email"
                placeholder="Masukan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* KATA SANDI */}
            <label className="login-label" htmlFor="password">
              Kata Sandi
            </label>
            <div className="login-input">
              <input
                id="password"
                type="password"
                placeholder="Masukkan sandi anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* BUTTON MASUK */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>

            {/* ATAU */}
            <div className="login-or">
              <span className="login-or-text">atau</span>
            </div>

            {/* GOOGLE LOGIN */}
            <button
              type="button"
              className="login-google"
              onClick={handleGoogleLogin}
            >
              <img
                src={googleLogo}
                alt="Google logo"
                className="login-google-icon"
              />
              <span className="login-google-text">Masuk dengan Google</span>
            </button>

            {/* REGISTER */}
            <div className="login-register">
              <span className="login-register-text">Belum punya akun?</span>
              <button
                type="button"
                className="login-register-link"
                onClick={handleRegisterClick}
              >
                Daftar sekarang
              </button>
            </div>
          </form>

          {/* LOGO KANAN */}
          <div className="login-hero">
            <img src={heartHero} alt="HeArt" className="login-hero-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
