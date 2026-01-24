"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import React from "react";

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const passwordInput = form.elements.namedItem(
      "password"
    ) as HTMLInputElement;

    const confirmPasswordInput = form.elements.namedItem(
      "confirm_password"
    ) as HTMLInputElement;

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
      alert("Password tidak sama");
      return;
    }

    const data = {
      nama_lengkap: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      no_telepon: (form.elements.namedItem("phone") as HTMLInputElement).value,
      role: (form.elements.namedItem("role") as HTMLSelectElement).value,
      password: password,
    };

    try {
      await api.post("/register", data);

      alert("Registrasi berhasil");
      router.push("/auth/login");
    } catch (err: any) {
      console.error("REGISTER ERROR:", err);

      if (err.response) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Gagal terhubung ke server");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">
          <h1>Daftar Akun</h1>
          <p>Bergabunglah dengan kami</p>
        </div>

        {/* Dummy input anti autofill */}
        <input type="text" name="fakeuser" style={{ display: "none" }} />
        <input type="password" name="fakepass" style={{ display: "none" }} />

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input name="name" required autoComplete="off" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Nomor HP</label>
            <input name="phone" required autoComplete="off" />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" required autoComplete="off">
              <option value="">Pilih Role</option>
              <option value="kontraktor">Kontraktor</option>
              <option value="pemilik">Pemilik Properti</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Konfirmasi Password</label>
            <input
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }}>
            Daftar
          </button>

          <div className="auth-link">
            Sudah punya akun? <a href="/auth/login">Masuk</a>
          </div>
        </form>
      </div>
    </div>
  );
}
