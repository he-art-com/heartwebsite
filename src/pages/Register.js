// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // atau Login.css kalau digabung

import heartHero from "../assets/heart.svg";
import googleLogo from "../assets/google.png";

const API_BASE_URL = "http://localhost:5000"; // samain dengan backend-mu

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    setSuccessMsg("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.email)) {
        newErrors.email = "Format email tidak valid.";
      }
    }

    if (!form.password) {
      newErrors.password = "Kata sandi wajib diisi.";
    } else if (form.password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Konfirmasi kata sandi tidak sama.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMsg("");
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setSuccessMsg("");

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          general: data.message || "Pendaftaran gagal.",
        }));
        setLoading(false);
        return;
      }

      setSuccessMsg("Pendaftaran berhasil! Silakan masuk dengan akun Anda.");

      setForm({
        email: "",
        password: "",
        confirmPassword: "",
      });

      // otomatis pindah ke login setelah sedikit jeda
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Register error:", err);
      setErrors((prev) => ({
        ...prev,
        general: "Terjadi kesalahan pada server. Coba lagi nanti.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        {/* STRIPES */}
        <div className="login-stripe login-stripe-1" />
        <div className="login-stripe login-stripe-2" />
        <div className="login-stripe login-stripe-3" />
        <div className="login-stripe login-stripe-4" />
        <div className="login-stripe login-stripe-5" />

        {/* KARTU PUTIH */}
        <div className="login-card">
          {/* FORM KIRI */}
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-title">Daftar</h1>
            <p className="login-subtitle">Daftar akun anda</p>

            {/* ERROR UMUM */}
            {errors.general && <p className="form-error">{errors.general}</p>}

            {/* SUKSES */}
            {successMsg && <p className="form-success">{successMsg}</p>}

            {/* EMAIL */}
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <div className="login-input">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Masukan email anda"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="form-error">{errors.email}</p>}

            {/* PASSWORD */}
            <label className="login-label" htmlFor="password">
              Kata Sandi
            </label>
            <div className="login-input">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan sandi anda"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && (
              <p className="form-error">{errors.password}</p>
            )}

            {/* CONFIRM PASSWORD */}
            <label className="login-label" htmlFor="confirmPassword">
              Konfirmasi Kata Sandi
            </label>
            <div className="login-input">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Masukkan ulang sandi anda"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword}</p>
            )}

            {/* BUTTON DAFTAR */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </button>

            {/* KE LOGIN */}
            <div className="login-register">
              <span className="login-register-text">Sudah punya akun?</span>
              <button
                type="button"
                className="login-register-link"
                onClick={goToLogin}
              >
                Masuk sekarang
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

export default Register;
