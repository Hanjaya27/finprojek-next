"use client";

import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = (e.currentTarget.email as HTMLInputElement).value;
    const password = (e.currentTarget.password as HTMLInputElement).value;

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      // simpan token & user
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // redirect berdasarkan role
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" required />
          </div>

          <button className="btn btn-primary" style={{ width: "100%" }}>
            Masuk
          </button>

          <div className="auth-link">
            <a href="/auth/forgot-password">Lupa password?</a>
          </div>

          <div className="auth-link">
            Belum memiliki akun? <a href="/auth/register">Daftar di sini</a>
          </div>
        </form>
      </div>
    </div>
  );
}
