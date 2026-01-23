'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// === TYPE DEFINITIONS ===
type Proyek = {
  id_proyek: number;
  nama_proyek: string;
  lokasi: string | null;
  biaya_kesepakatan: number | null;
  dokumen_mou: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  status: string | null;
};

type ProgressItem = {
  id_progress: number;
  judul_update: string | null;
  deskripsi: string | null;
  persentase: number;
  foto_progress: string | null;
  tgl_update: string;
};

export default function DetailProyek() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [persentaseTerakhir, setPersentaseTerakhir] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // URL Backend Dinamis
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchProgress = async () => {
      try {
        // Menggunakan env variable untuk endpoint API
        const res = await fetch(
          `${API_BASE_URL}/api/pemilik/proyek/${id}/progress`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Gagal mengambil data proyek');
        }

        const data = await res.json();

        setProyek(data?.proyek ?? null);
        setProgressList(Array.isArray(data?.progress_list) ? data.progress_list : []);
        setPersentaseTerakhir(data?.persentase_terakhir ?? 0);
      } catch (err: any) {
        console.error("Error fetching detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProgress();
  }, [id, router, API_BASE_URL]);

  if (loading) return <p className="main-content text-center">Loading detail proyek...</p>;

  if (error)
    return (
      <main className="main-content">
        <div className="alert alert-error" style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
            {error}
        </div>
        <button className="btn btn-sm" onClick={() => router.back()}>Kembali</button>
      </main>
    );

  return (
    <main className="main-content">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1 className="title-inline">
          <button onClick={() => router.back()} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>←</button>
          <span>Detail Proyek</span>
        </h1>
        {proyek && <span className="project-title-badge">{proyek.nama_proyek}</span>}
      </div>

      {/* ===== DETAIL PROYEK ===== */}
      {proyek && (
        <section className="card section-spacing">
          <h3>Informasi Proyek</h3>
          <table className="project-detail-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Nama Proyek</td>
                <td>{proyek.nama_proyek}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Lokasi</td>
                <td>{proyek.lokasi || '-'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Biaya Kesepakatan</td>
                <td>
                  {proyek.biaya_kesepakatan
                    ? `Rp ${proyek.biaya_kesepakatan.toLocaleString('id-ID')}`
                    : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Tanggal Mulai</td>
                <td>{proyek.tgl_mulai ? new Date(proyek.tgl_mulai).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Tanggal Selesai</td>
                <td>{proyek.tgl_selesai ? new Date(proyek.tgl_selesai).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Dokumen MOU</td>
                <td>
                  {proyek.dokumen_mou ? (
                    // PERBAIKAN: Link Dokumen Dinamis
                    <a
                      href={`${API_BASE_URL}/storage/${proyek.dokumen_mou}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Lihat Dokumen
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Status</td>
                <td>{proyek.status || '-'}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* ===== PROGRES SAAT INI ===== */}
      <section className="card section-spacing">
        <h3>Progres Saat Ini</h3>
        <div className="progress-bar-container" style={{ background: '#eee', height: '20px', borderRadius: '10px', overflow: 'hidden', margin: '10px 0' }}>
          <div 
            className="progress-fill" 
            style={{ 
                width: `${persentaseTerakhir}%`, 
                background: '#4CAF50', 
                height: '100%',
                transition: 'width 0.5s ease'
            }} 
          />
        </div>
        <p style={{ fontWeight: 'bold', textAlign: 'right' }}>{persentaseTerakhir}% selesai</p>
      </section>

      {/* ===== RIWAYAT PROGRES ===== */}
      <section className="card section-spacing">
        <h3>Riwayat Progres</h3>

        {progressList.length === 0 && <p className="text-gray-500 italic">Belum ada update progres dari kontraktor</p>}

        <div className="timeline">
          {progressList.map((item, index) => (
            <div key={item.id_progress} className="timeline-item horizontal" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              
              {/* HEADER ITEM */}
              <div className="timeline-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong className="progress-title">
                    #{index + 1} - {item.judul_update || 'Update Progres'}
                </strong>
                <span className="progress-date text-sm text-gray-500">
                    {new Date(item.tgl_update).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                </span>
              </div>

              {/* CARD CONTENT */}
              <div className="timeline-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                
                {/* MEDIA (PERBAIKAN: URL GAMBAR/VIDEO DINAMIS) */}
                <div className="timeline-media" style={{ width: '150px', flexShrink: 0 }}>
                  {item.foto_progress ? (
                    item.foto_progress.endsWith('.mp4') ? (
                      <video
                        src={`${API_BASE_URL}/storage/${item.foto_progress}`}
                        controls
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    ) : (
                      <img
                        src={`${API_BASE_URL}/storage/${item.foto_progress}`}
                        alt="Dokumentasi"
                        style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )
                  ) : (
                    <div className="no-media" style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center', fontSize: '0.8rem' }}>
                        Tidak ada foto
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="timeline-info" style={{ flex: 1 }}>
                  <div className="progress-percent" style={{ fontWeight: 'bold', color: '#2ecc71', marginBottom: '5px' }}>
                    Progress Capaian: {item.persentase}%
                  </div>
                  {item.deskripsi && <p className="progress-desc">{item.deskripsi}</p>}
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}