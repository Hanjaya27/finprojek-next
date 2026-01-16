'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

export default function EditPekerjaanModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const [form, setForm] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fungsi async untuk ambil data
    const fetchData = async () => {
      try {
        // 1️⃣ Ambil list proyek terlebih dahulu
        const proyekRes = await api.get('/api/proyek');
        setProjects(proyekRes.data);

        // 2️⃣ Ambil detail pekerjaan
        const pekerjaanRes = await api.get(`/api/pekerjaan/${id}`);
        const pekerjaan = pekerjaanRes.data.pekerjaan; // pastikan ambil objek pekerjaan
        setForm({
          id_proyek: pekerjaan.id_proyek,
          nama_pekerjaan: pekerjaan.nama_pekerjaan,
          keterangan: pekerjaan.keterangan ?? '',
        });
      } catch (err) {
        console.error(err);
        alert('Gagal memuat data pekerjaan atau proyek');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, onClose]);

  if (loading || !form) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.put(`/api/pekerjaan/${id}`, {
        id_proyek: form.id_proyek,
        nama_pekerjaan: form.nama_pekerjaan,
        keterangan: form.keterangan,
      });

      onClose();
      setTimeout(() => location.reload(), 300);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengupdate pekerjaan');
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Pekerjaan</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proyek</label>
            <select
              value={form.id_proyek}
              onChange={e =>
                setForm({ ...form, id_proyek: Number(e.target.value) })
              }
              required
            >
              <option value="">Pilih Proyek</option>
              {projects.map(p => (
                <option key={p.id_proyek} value={p.id_proyek}>
                  {p.nama_proyek}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nama Pekerjaan</label>
            <input
              value={form.nama_pekerjaan}
              onChange={e =>
                setForm({ ...form, nama_pekerjaan: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Keterangan (Opsional)</label>
            <textarea
              rows={3}
              value={form.keterangan ?? ''}
              onChange={e =>
                setForm({ ...form, keterangan: e.target.value })
              }
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>Batal</button>
            <button className="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
}
