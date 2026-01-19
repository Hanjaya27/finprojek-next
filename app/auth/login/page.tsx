"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data); // 🔥 DEBUG

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        throw new Error("Response login tidak valid");
      }

      // simpan ke localStorage
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // redirect sesuai role
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "kontraktor":
          router.push("/kontraktor/dashboard");
          break;
        case "pemilik":
          router.push("/pemilik/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      alert(err.response?.data?.message || err.message || "Login gagal");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">
          <h1>Masuk</h1>
          <p>Selamat datang kembali</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Masuk
          </button>

          <div className="auth-link">
            <a href="/auth/forgot-password">Lupa password?</a>
          </div>

          <div className="auth-link">
            Belum punya akun? <a href="/auth/register">Daftar</a>
          </div>
        </form>
      </div>
    </div>
  );
}
