"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
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

      const { token, user } = res.data;

      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

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
        <h1>Masuk</h1>

        <form onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Email" required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />

          <button type="submit">Masuk</button>
        </form>
      </div>
    </div>
  );
}
