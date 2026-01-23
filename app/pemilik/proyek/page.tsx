'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GabungProyekModal from './GabungProyekModal';

interface Proyek {
  id_proyek: number;
  nama_proyek: string;
  tgl_mulai: string | null;
  status: string;
}

export default function ProyekPemilikPage() {
  const router = useRouter();
  const [proyek, setProyek] = useState<Proyek[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Ambil URL API dari Environment Variable
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return router.push('/auth/login');

    // Gunakan URL dinamis, bukan localhost
    fetch(`${API_BASE_URL}/api/pemilik/proyek`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json' 
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal mengambil data proyek');
        return res.json();
      })
      .then(setProyek)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router, API_BASE_URL]);

  if (loading) return <p className="p-4 text-center">Loading data proyek...</p>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;

  return (
    <>
      <main className="main-content">
        <div className="page-header">
          <h1>Proyek Saya</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Gabung Proyek
          </button>
        </div>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Proyek</th>
                <th>Tanggal Mulai</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {proyek.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                    Belum tergabung dalam proyek. Silakan gabung proyek baru.
                  </td>
                </tr>
              ) : (
                proyek.map((p) => (
                  <tr key={p.id_proyek}>
                    <td>{p.nama_proyek}</td>
                    <td>
                      {p.tgl_mulai
                        ? new Date(p.tgl_mulai).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'Selesai' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => router.push(`/pemilik/proyek/${p.id_proyek}`)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <GabungProyekModal
          onClose={() => setShowModal(false)}
          onSuccess={(newProyek: Proyek) => setProyek((prev) => [...prev, newProyek])}
        />
      )}
    </>
  );
}