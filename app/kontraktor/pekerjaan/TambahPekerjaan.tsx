'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function TambahPekerjaan({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/api/proyek')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData();

    formData.append('nama_pekerjaan', form.nama_pekerjaan.value);
    formData.append('id_proyek', form.id_proyek.value);

    if (form.keterangan.value) {
      formData.append('keterangan', form.keterangan.value);
    }

    try {
      await api.post('/api/pekerjaan', formData);

      // ✅ INI PENGGANTI location.reload()
      onSuccess();
    } catch (err: any) {
      console.error('STATUS:', err.response?.status);
      console.error('DATA:', err.response?.data);
      alert(err.response?.data?.message || 'Validasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tambah Pekerjaan</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Pekerjaan</label>
            <input name="nama_pekerjaan" required />
          </div>

          <div className="form-group">
            <label>Proyek</label>
            <select name="id_proyek" required>
              <option value="">Pilih Proyek</option>
              {projects.map(p => (
                <option key={p.id_proyek} value={p.id_proyek}>
                  {p.nama_proyek}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Keterangan</label>
            <textarea name="keterangan" />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Batal
            </button>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
