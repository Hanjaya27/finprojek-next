'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; // Gunakan axios instance yang sudah ada

type Proyek = {
  id_proyek: number;
  nama_proyek: string;
  // Handle jika backend kirim string/number/null
  progres: number | string | null; 
};

export default function ProgresPage() {
  const router = useRouter();
  // Inisialisasi array kosong
  const [data, setData] = useState<Proyek[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gunakan api.get() -> Otomatis handle Base URL & Token
    // Pastikan endpoint di backend Anda benar '/progres' atau '/proyek'
    // Jika endpoint khusus progres tidak ada, biasanya pakai '/proyek'
    api.get('/proyek') 
      .then(res => {
        // PERBAIKAN: Ambil data dari wrapper .data.data
        const rawData = res.data.data || res.data;
        
        // Safety check: Pastikan Array
        const list = Array.isArray(rawData) ? rawData : [];
        setData(list);
      })
      .catch(err => {
        console.error("Gagal load progres:", err);
        // Jika token expired/invalid, axios interceptor biasanya handle redirect
        // tapi kita bisa jaga-jaga set empty array
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="main-content">Loading data progres...</p>;

  return (
    <main className="main-content">
      {/* Header Halaman */}
      <div style={{ marginBottom: 24 }}>
        <h1>Progres Proyek</h1>
        <p style={{ color: '#666' }}>Monitoring persentase penyelesaian proyek</p>
      </div>

      <div className="card">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nama Proyek</th>
              <th style={{ width: '40%' }}>Status Penyelesaian</th>
              <th className="center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="empty">Belum ada data proyek</td>
              </tr>
            ) : (
              data.map(item => {
                // Konversi aman ke number 0-100
                // Jika backend belum kirim 'progres', default ke 0
                const rawProgres = Number(item.progres) || 0;
                const value = Math.min(100, Math.max(0, rawProgres));

                // Tentukan warna bar berdasarkan progress
                let barColor = '#3b82f6'; // Biru (Default)
                if (value >= 100) barColor = '#10b981'; // Hijau (Selesai)
                else if (value < 20) barColor = '#f59e0b'; // Oranye (Baru mulai)

                return (
                  <tr key={item.id_proyek}>
                    <td style={{ fontWeight: 500 }}>{item.nama_proyek}</td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          flex: 1, 
                          height: 8, 
                          background: '#e5e7eb', 
                          borderRadius: 4,
                          overflow: 'hidden' 
                        }}>
                          <div
                            style={{ 
                              width: `${value}%`, 
                              height: '100%', 
                              background: barColor,
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                        <span style={{ minWidth: 40, textAlign: 'right', fontWeight: 'bold', color: '#444' }}>
                          {Math.round(value)}%
                        </span>
                      </div>
                    </td>

                    <td className="center">
                      <button
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.9rem' }}
                        onClick={() =>
                          router.push(`/kontraktor/progres/${item.id_proyek}`)
                        }
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}