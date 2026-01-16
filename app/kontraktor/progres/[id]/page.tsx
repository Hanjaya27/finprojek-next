'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Proyek = {
  id_proyek: number;
  nama_proyek: string;
};

type ProgressItem = {
  id_progress: number;
  judul_update: string | null;
  deskripsi: string | null;
  persentase: number;
  foto_progress: string | null;
  tgl_update: string;
};

export default function DetailProgresPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [proyek, setProyek] = useState<Proyek | null>(null);
  const [progressList, setProgressList] = useState<ProgressItem[]>([]);
  const [persentaseTerakhir, setPersentaseTerakhir] = useState(0);

  const fetchDetail = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const res = await fetch(`http://localhost:8000/api/progres/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    setProyek(data.proyek);
    setProgressList(data.progress_list);
    setPersentaseTerakhir(data.persentase_terakhir);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="main-content">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h1 className="title-inline">
            <span>Detail Progres Proyek</span>
            {proyek && (
            <span className="project-title">
                {proyek.nama_proyek}
            </span>
            )}
        </h1>

        <button
            className="btn-primary"
            onClick={() =>
            router.push(`/kontraktor/progres/${id}/tambah`)
            }
        >
            + Upload Progres
        </button>
        </div>


      {/* ===== PROGRESS SAAT INI ===== */}
      <section className="card section-spacing">
        <h3>Progress Saat Ini</h3>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${persentaseTerakhir}%` }}
          />
        </div>

        <p>{persentaseTerakhir}% selesai</p>
      </section>

      {/* ===== RIWAYAT PROGRES ===== */}
      <section className="card section-spacing">
        <h3>Riwayat Progres</h3>

        {progressList.length === 0 && (
          <p>Belum ada progres</p>
        )}

        <div className="timeline">
          {progressList.map((item, index) => (
            <div key={item.id_progress} className="timeline-item horizontal">

              {/* BADGE NOMOR */}
              <div className="timeline-badge styled">
                <span>{index + 1}</span>
              </div>

              {/* CARD */}
              <div className="timeline-card">
                {/* MEDIA 3/4 */}
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
                    <div className="no-media">
                      Tidak ada dokumentasi
                    </div>
                  )}
                </div>

                {/* INFO 1/4 */}
                <div className="timeline-info">
                  <strong className="progress-title">
                    {item.judul_update || `Update Progres`}
                  </strong>

                  <div className="progress-percent">
                    {item.persentase}%
                  </div>

                  {item.deskripsi && (
                    <p className="progress-desc">
                      {item.deskripsi}
                    </p>
                  )}

                  <small className="progress-date">
                    {item.tgl_update}
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
