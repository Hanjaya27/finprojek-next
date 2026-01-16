'use client';

import { useEffect, useState } from 'react';

export default function PemilikDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    fetch('http://localhost:8000/api/pemilik/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <main className="main-content">
      <h1>Dashboard Pemilik</h1>
      <p>Selamat datang, {data.nama}</p>

      <div className="grid grid-3">
        <div className="summary-card">
          <div>Total Proyek</div>
          <strong>{data.total_proyek}</strong>
        </div>

        <div className="summary-card">
          <div>Proyek Berjalan</div>
          <strong>{data.proyek_berjalan}</strong>
        </div>

        <div className="summary-card">
          <div>Proyek Selesai</div>
          <strong>{data.proyek_selesai}</strong>
        </div>
      </div>
    </main>
  );
}
