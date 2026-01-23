'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

// Definisikan tipe data agar autocomplete jalan dan lebih aman
interface Proyek {
  id_proyek: number;
  kode_proyek: string;
  nama_proyek: string;
  status: string;
  lokasi: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  biaya_kesepakatan: string | number | null;
  dokumen_mou_url: string | null; // Pastikan backend kirim full URL atau handle di frontend
}

export default function DetailProyekPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  // Ubah initial state jadi null atau tipe Proyek
  const [proyek, setProyek] = useState<Proyek | null>(null);

  useEffect(() => {
    api.get(`/proyek/${id}`)
      .then(res => {
        // PERBAIKAN DI SINI:
        // Axios response -> res.data (Body JSON) -> .data (Wrapper Laravel)
        setProyek(res.data.data); 
      })
      .catch((err) => {
        console.error(err);
        alert('Proyek tidak ditemukan');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <p className="main-content">Loading...</p>;
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
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Status</label>
          <p>{proyek.status}</p>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Lokasi</label>
          <p>{proyek.lokasi || '-'}</p>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Tanggal Mulai</label>
          <p>
            {proyek.tgl_mulai
              ? new Date(proyek.tgl_mulai).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
              : '-'}
          </p>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Tanggal Selesai</label>
          <p>
            {proyek.tgl_selesai
              ? new Date(proyek.tgl_selesai).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })
              : '-'}
          </p>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>Biaya Kesepakatan</label>
          <p>
            {proyek.biaya_kesepakatan
              ? `Rp ${Number(proyek.biaya_kesepakatan).toLocaleString('id-ID')}`
              : '-'}
          </p>
        </div>
      </div>

      {/* DOKUMEN */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3>Dokumen</h3>
        
        {/* Pastikan menggunakan field URL yang benar dari respon API */}
        {proyek.dokumen_mou_url ? (
          <a
            href={proyek.dokumen_mou_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-block', marginTop: 10 }}
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