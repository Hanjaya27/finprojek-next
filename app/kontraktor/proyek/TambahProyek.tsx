'use client';

import { useState } from 'react';
import api from '@/lib/axios';

export default function TambahProyekModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData();

    formData.append('nama_proyek', (form.nama as HTMLInputElement).value);
    formData.append('lokasi', (form.lokasi as HTMLInputElement).value);
    formData.append('biaya_kesepakatan', (form.biaya as HTMLInputElement).value);
    formData.append('tgl_mulai', (form.tgl_mulai as HTMLInputElement).value);
    formData.append('tgl_selesai', (form.tgl_selesai as HTMLInputElement).value);

    // dokumen MOU opsional
    const mouFile = (form.mou as HTMLInputElement).files;
    if (mouFile && mouFile.length > 0) {
      formData.append('dokumen_mou', mouFile[0]);
    }

    try {
      const token = localStorage.getItem('token');
    
      await api.post('/proyek', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
    
      alert('Proyek berhasil ditambahkan');
      onClose();
      setTimeout(() => location.reload(), 300);
    } catch (err: any) {
      console.log('STATUS:', err.response?.status);
      console.log('DATA:', err.response?.data);
      alert(err.response?.data?.message || 'Gagal menambahkan proyek');
    }
     finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tambah Proyek Baru</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Proyek</label>
            <input name="nama" required />
          </div>

          <div className="form-group">
            <label>Lokasi</label>
            <input name="lokasi" required />
          </div>

          <div className="form-group">
            <label>Biaya Kesepakatan</label>
            <input name="biaya" type="number" required />
          </div>

          <div className="form-group">
            <label>Tanggal Mulai</label>
            <input name="tgl_mulai" type="date" required />
          </div>

          <div className="form-group">
            <label>Tanggal Selesai</label>
            <input name="tgl_selesai" type="date" required />
          </div>

          <div className="form-group">
            <label>Dokumen MOU (PDF/DOC) - Opsional</label>
            <input name="mou" type="file" accept=".pdf,.doc,.docx" />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Proyek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
