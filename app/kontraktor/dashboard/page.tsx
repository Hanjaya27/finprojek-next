'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError('Token tidak ditemukan');
          return;
        }

        const res = await fetch(
          'http://localhost:8000/api/kontraktor/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error('Gagal mengambil data');

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Gagal mengambil data dashboard');
      }
    };

    fetchDashboard();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  /* =======================
     DATA AMAN (ANTI ERROR)
  ======================= */
  const statusProyek = data.status_proyek ?? {
    berjalan: 0,
    selesai: 0,
  };

  const pekerjaanPerProyek = data.pekerjaan_per_proyek ?? [];

  /* =======================
     CHART 1: STATUS PROYEK
  ======================= */
  const statusChart = {
    labels: ['Berjalan', 'Selesai'],
    datasets: [
      {
        label: 'Jumlah Proyek',
        data: [
          statusProyek.berjalan ?? 0,
          statusProyek.selesai ?? 0,
        ],
        backgroundColor: ['#1a73e8', '#34a853'],
        borderRadius: 6,
      },
    ],
  };

  /* =======================
     CHART 2: PEKERJAAN / PROYEK
  ======================= */
  const pekerjaanChart = {
    labels: pekerjaanPerProyek.map((p: any) => p.nama_proyek),
    datasets: [
      {
        label: 'Jumlah Pekerjaan',
        data: pekerjaanPerProyek.map((p: any) => p.total_pekerjaan),
        backgroundColor: '#fbbc04',
        borderRadius: 6,
      },
    ],
  };

  return (
    <main className="main-content">
      <h1>Dashboard</h1>
      <p style={{ color: '#ACACAC', marginBottom: '2rem' }}>
        Selamat datang kembali, {data.nama}
      </p>

      {/* ===== SUMMARY ===== */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="summary-card">
          <div className="summary-card-label">Total Proyek</div>
          <div className="summary-card-value">{data.total_proyek ?? 0}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Proyek Berjalan</div>
          <div className="summary-card-value">
            {statusProyek.berjalan ?? 0}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Proyek Selesai</div>
          <div className="summary-card-value">
            {statusProyek.selesai ?? 0}
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-label">Total Pekerjaan</div>
          <div className="summary-card-value">
            {data.total_pekerjaan ?? 0}
          </div>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Status Proyek</div>
          </div>

          <Bar data={statusChart} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Jumlah Pekerjaan per Proyek</div>
          </div>

          {pekerjaanPerProyek.length === 0 ? (
            <div
              style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ACACAC',
                background: '#EBECEE',
                borderRadius: 8,
              }}
            >
              Belum ada data pekerjaan
            </div>
          ) : (
            <Bar data={pekerjaanChart} />
          )}
        </div>
      </div>
    </main>
  );
}
