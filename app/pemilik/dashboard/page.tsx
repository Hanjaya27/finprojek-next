'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios'; // Gunakan Axios helper

export default function PemilikDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Gunakan api.get, otomatis handle token & URL
    api.get('/pemilik/dashboard')
      .then(res => {
        // Handle wrapper .data atau .data.data
        const raw = res.data.data || res.data;
        setData(raw);
      })
      .catch(err => console.error("Gagal load dashboard:", err));
  }, []);

  if (!data) return <p className="main-content">Loading dashboard...</p>;

  return (
    <main className="main-content">
      <h1 className="title">Dashboard Pemilik</h1>
      
      {/* Safety check jika data.nama ada */}
      <p style={{marginBottom: 20}}>Selamat datang, <strong>{data.nama || 'Pemilik'}</strong></p>

      <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <div className="card summary-card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ color: '#666', marginBottom: 5 }}>Total Proyek</div>
          <strong style={{ fontSize: '2rem', color: '#3b82f6' }}>{data.total_proyek || 0}</strong>
        </div>

        <div className="card summary-card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ color: '#666', marginBottom: 5 }}>Proyek Berjalan</div>
          <strong style={{ fontSize: '2rem', color: '#f59e0b' }}>{data.proyek_berjalan || 0}</strong>
        </div>

        <div className="card summary-card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ color: '#666', marginBottom: 5 }}>Proyek Selesai</div>
          <strong style={{ fontSize: '2rem', color: '#10b981' }}>{data.proyek_selesai || 0}</strong>
        </div>
      </div>
    </main>
  );
}