'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchProgress = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/pemilik/proyek/${id}/progress`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Gagal mengambil data');
        }

        const data = await res.json();

        setProyek(data?.proyek ?? null);
        setProgressList(Array.isArray(data?.progress_list) ? data.progress_list : []);
        setPersentaseTerakhir(data?.persentase_terakhir ?? 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [id, router]);

  if (loading) return <p className="main-content">Loading...</p>;

  if (error)
    return (
      <main className="main-content">
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    );

  return (
    <main className="main-content">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1 className="title-inline">
          <span>Detail Proyek</span>
          {proyek && <span className="project-title">{proyek.nama_proyek}</span>}
        </h1>
      </div>

      {/* ===== DETAIL PROYEK ===== */}
      {proyek && (
        <section className="card section-spacing">
          <h3>Informasi Proyek</h3>
          <table className="project-detail-table">
            <tbody>
              <tr>
                <td>Nama Proyek</td>
                <td>{proyek.nama_proyek}</td>
              </tr>
              <tr>
                <td>Lokasi</td>
                <td>{proyek.lokasi || '-'}</td>
              </tr>
              <tr>
                <td>Biaya Kesepakatan</td>
                <td>
                  {proyek.biaya_kesepakatan
                    ? `Rp ${proyek.biaya_kesepakatan.toLocaleString('id-ID')}`
                    : '-'}
                </td>
              </tr>
              <tr>
                <td>Tanggal Mulai</td>
                <td>{proyek.tgl_mulai ? new Date(proyek.tgl_mulai).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
              <tr>
                <td>Tanggal Selesai</td>
                <td>{proyek.tgl_selesai ? new Date(proyek.tgl_selesai).toLocaleDateString('id-ID') : '-'}</td>
              </tr>
              <tr>
                <td>Dokumen MOU</td>
                <td>
                  {proyek.dokumen_mou ? (
                    <a
                      href={`http://localhost:8000/storage/${proyek.dokumen_mou}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Lihat Dokumen
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
              <tr>
                <td>Status</td>
                <td>{proyek.status || '-'}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* ===== PROGRES SAAT INI ===== */}
      <section className="card section-spacing">
        <h3>Progres Saat Ini</h3>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${persentaseTerakhir}%` }} />
        </div>

        <p>{persentaseTerakhir}% selesai</p>
      </section>

      {/* ===== RIWAYAT PROGRES ===== */}
      <section className="card section-spacing">
        <h3>Riwayat Progres</h3>

        {progressList.length === 0 && <p>Belum ada update progres dari kontraktor</p>}

        <div className="timeline">
          {progressList.map((item, index) => (
            <div key={item.id_progress} className="timeline-item horizontal">
              {/* BADGE */}
              <div className="timeline-badge styled">
                <span>{index + 1}</span>
              </div>

              {/* CARD */}
              <div className="timeline-card">
                {/* MEDIA */}
                <div className="timeline-media">
                  {item.foto_progress ? (
                    item.foto_progress.endsWith('.mp4') ? (
                      <video
                        src={`http://localhost:8000/storage/${item.foto_progress}`}
                        controls
                      />
                    ) : (
                      <img
                        src={`http://localhost:8000/storage/${item.foto_progress}`}
                        alt="Dokumentasi progres"
                      />
                    )
                  ) : (
                    <div className="no-media">Tidak ada dokumentasi</div>
                  )}
                </div>

                {/* INFO */}
                <div className="timeline-info">
                  <strong className="progress-title">
                    {item.judul_update || 'Update Progres'}
                  </strong>

                  <div className="progress-percent">{item.persentase}%</div>

                  {item.deskripsi && <p className="progress-desc">{item.deskripsi}</p>}

                  <small className="progress-date">
                    {new Date(item.tgl_update).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
