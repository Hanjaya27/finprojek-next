'use client';

import '../../styles/style.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function PemilikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch('http://localhost:8000/api/pemilik/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        // 🔥 update localStorage & state SEKALIGUS
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        localStorage.clear();
        router.push('/auth/login');
      });
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header>
        <div className="header-content">
          <div className="header-left">
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <span>FinProjek</span>
          </div>

          <div className="header-right">
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ===== WRAPPER ===== */}
      <div className="dashboard-wrapper">
        <aside className="sidebar">
          {/* ===== PROFIL SIDEBAR ===== */}
          <div
            className="sidebar-profile"
            onClick={() => router.push('/pemilik/profile')}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={
                user?.foto_profil
                  ? `http://localhost:8000/storage/${user.foto_profil}`
                  : '/images/default-avatar.png'
              }
              alt="Foto Profil"
              className="sidebar-avatar"
            />

            <div className="sidebar-profile-info">
              <strong>{user?.nama_lengkap || 'Loading...'}</strong>
              <span>Pemilik Properti</span>
            </div>
          </div>

          <hr className="sidebar-divider" />

          {/* ===== MENU ===== */}
          <ul className="sidebar-menu">
            {[
              ['Proyek Saya', '/pemilik/proyek'],
              ['Kelola Profil', '/pemilik/profile'],
            ].map(([label, href]) => (
              <li key={href} className={pathname === href ? 'active' : ''}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </aside>

        {children}
      </div>
    </>
  );
}
