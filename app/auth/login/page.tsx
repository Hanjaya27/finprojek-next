"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 🔥 WAJIB, sudah benar

    const form = e.currentTarget;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // simpan token & user
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // redirect sesuai role
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "kontraktor") {
        router.push("/kontraktor/dashboard");
      } else if (user.role === "pemilik") {
        router.push("/pemilik/dashboard");
      } else {
        router.push("/auth/login");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      alert(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">
          <h1>Masuk</h1>
          <p>Selamat datang kembali</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            Masuk
          </button>

          <div className="auth-link">
            <a href="/auth/forgot-password">Lupa password?</a>
          </div>

          <div className="auth-link">
            Belum memiliki akun?{" "}
            <a href="/auth/register">Daftar di sini</a>
          </div>
        </form>
      </div>
    </div>
  );
}
