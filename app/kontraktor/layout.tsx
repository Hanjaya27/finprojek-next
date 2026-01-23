'use client';

import '../../styles/style.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function KontraktorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sisaHari, setSisaHari] = useState<number | null>(null);

  // 1. Ambil URL API dari Environment Variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.finprojek.web.id';

  // 2. Buat URL khusus untuk Storage (Hapus akhiran "/api" jika ada)
  // Ini penting agar link gambar menjadi: https://domain.com/storage/foto.png
  const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // HITUNG SISA HARI TRIAL (AMAN)
    if (parsedUser.vip_expired_at) {
      const expired = new Date(parsedUser.vip_expired_at);
      const now = new Date();

      const diffTime = expired.getTime() - now.getTime();
      const diffDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setSisaHari(diffDay);
    }
  }, [router]); // Tambahkan router ke dependency array agar clean

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  
    alert('Anda berhasil logout'); // NOTIFIKASI
  
    router.push('/');
  };
  

  // PENTING: cegah render sebelum user ada
  if (!user) return null;

  return (
    <>
      <header>
        <div className="header-content">
          <div className="header-left">
            <img src="/images/logo.png" alt="Logo" className="logo" />
            <span>FinProjek</span>
          </div>

          <div className="header-right">
            {user.is_premium > 0 ? (
              <div className="vip-badge">👑 VIP</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <button
                  className="upgrade-btn"
                  onClick={() => router.push('/kontraktor/upgrade')}
                >
                  Upgrade ke Premium
                </button>

                {sisaHari !== null && (
                  <small style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                    {sisaHari > 0
                      ? `Trial: sisa ${sisaHari} hari`
                      : 'Trial sudah habis'}
                  </small>
                )}
              </div>
            )}

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-wrapper">
        <aside className="sidebar">
          <div
            className="sidebar-profile"
            onClick={() => router.push('/kontraktor/profile')}
            style={{ cursor: 'pointer' }}
          >
            {/* 3. PERBAIKAN: Gunakan STORAGE_BASE_URL dinamis */}
            <img
              src={
                user.foto_profil
                  ? `${STORAGE_BASE_URL}/storage/${user.foto_profil}`
                  : '/images/default-avatar.png'
              }
              alt="Foto Profil"
              className="sidebar-avatar"
            />

            <div className="sidebar-profile-info">
              <strong>{user.nama_lengkap}</strong>
              <span>Kontraktor</span>
            </div>
          </div>

          <hr className="sidebar-divider" />

          <ul className="sidebar-menu">
            {[
              ['Dashboard', '/kontraktor/dashboard'],
              ['Proyek', '/kontraktor/proyek'],
              ['Pekerjaan', '/kontraktor/pekerjaan'],
              ['Pengeluaran', '/kontraktor/pengeluaran'],
              ['Material', '/kontraktor/material'],
              ['Laporan Keuangan', '/kontraktor/laporan-keuangan'],
              ['Progres', '/kontraktor/progres'],
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