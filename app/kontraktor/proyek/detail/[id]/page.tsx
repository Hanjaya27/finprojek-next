'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';


export default function DetailProyekPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [proyek, setProyek] = useState<any>(null);

  useEffect(() => {
    api.get(`/proyek/${id}`)
      .then(res => setProyek(res.data))
      .catch(() => {
        alert('Proyek tidak ditemukan');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (!proyek) return null;

  return (
    <main className="main-content" style={{ maxWidth: 900 }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1>{proyek.nama_proyek}</h1>
        <p style={{ color: '#777' }}>
          Kode Proyek: <strong>{proyek.kode_proyek}</strong>
        </p>
      </div>

      {/* INFORMASI UTAMA */}
      <div className="card grid-2 gap-4">
        <div>
          <label>Status</label>
          <p>{proyek.status}</p>
        </div>

        <div>
          <label>Lokasi</label>
          <p>{proyek.lokasi || '-'}</p>
        </div>

        <div>
          <label>Tanggal Mulai</label>
          <p>
            {proyek.tgl_mulai
              ? new Date(proyek.tgl_mulai).toLocaleDateString('id-ID')
              : '-'}
          </p>
        </div>

        <div>
          <label>Tanggal Selesai</label>
          <p>
            {proyek.tgl_selesai
              ? new Date(proyek.tgl_selesai).toLocaleDateString('id-ID')
              : '-'}
          </p>
        </div>

        <div>
          <label>Biaya Kesepakatan</label>
          <p>
            {proyek.biaya_kesepakatan
              ? `Rp ${Number(proyek.biaya_kesepakatan).toLocaleString('id-ID', {
                  maximumFractionDigits: 0,
                })}`
              : '-'}
          </p>
        </div>
      </div>

{/* DOKUMEN */}
<div className="card" style={{ marginTop: 24 }}>
  <h3>Dokumen</h3>

  {proyek.dokumen_mou_url ? (
    <a
      href={proyek.dokumen_mou_url}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-primary"
    >
      Lihat Dokumen MOU
    </a>
  ) : (
    <p style={{ color: '#777' }}>Tidak ada dokumen</p>
  )}
</div>


      {/* AKSI */}
      <div style={{ marginTop: 32 }}>
        <button className="btn" onClick={() => router.back()}>
          ← Kembali
        </button>
      </div>
    </main>
  );
}
