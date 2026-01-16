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

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return router.push('/auth/login');

    fetch('http://localhost:8000/api/pemilik/proyek', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setProyek)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p>Loading...</p>;

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
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    Belum tergabung dalam proyek
                  </td>
                </tr>
              ) : (
                proyek.map(p => (
                  <tr key={p.id_proyek}>
                    <td>{p.nama_proyek}</td>
                    <td>
                      {p.tgl_mulai
                        ? new Date(p.tgl_mulai).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td>{p.status}</td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          router.push(`/pemilik/proyek/${p.id_proyek}`)
                        }
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
          onSuccess={(p: Proyek) =>
            setProyek(prev => [...prev, p])
          }
        />
      )}
    </>
  );
}
