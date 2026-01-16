'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function EditProyekModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/api/proyek/${id}`).then(res => {
      setForm(res.data);
    });
  }, [id]);

  if (!form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      // spoof PUT (WAJIB)
      fd.append('_method', 'PUT');

      fd.append('nama_proyek', form.nama_proyek);
      fd.append('lokasi', form.lokasi);
      fd.append('biaya_kesepakatan', String(form.biaya_kesepakatan));
      fd.append('tgl_mulai', form.tgl_mulai ?? '');
      fd.append('tgl_selesai', form.tgl_selesai ?? '');
      fd.append('status', form.status);

      if (form.mou) {
        fd.append('dokumen_mou', form.mou);
      }

      await api.post(`/api/proyek/${id}`, fd);

      onClose();
      location.reload();
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        alert('Masa trial Anda sudah habis. Silakan upgrade ke Premium.');
        onClose();
        router.push('/kontraktor/upgrade');
        return;
      }

      alert('Gagal memperbarui proyek.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Proyek</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Proyek</label>
            <input
              value={form.nama_proyek}
              onChange={e =>
                setForm({ ...form, nama_proyek: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Lokasi Proyek</label>
            <input
              value={form.lokasi}
              onChange={e =>
                setForm({ ...form, lokasi: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Biaya Kesepakatan</label>
            <input
              type="number"
              value={form.biaya_kesepakatan}
              onChange={e =>
                setForm({
                  ...form,
                  biaya_kesepakatan: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              value={form.tgl_mulai ?? ''}
              onChange={e =>
                setForm({ ...form, tgl_mulai: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Tanggal Selesai</label>
            <input
              type="date"
              value={form.tgl_selesai ?? ''}
              onChange={e =>
                setForm({ ...form, tgl_selesai: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Status Proyek</label>
            <select
              value={form.status}
              onChange={e =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditunda">Ditunda</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dokumen MOU (opsional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e =>
                setForm({ ...form, mou: e.target.files?.[0] })
              }
            />
            {form.dokumen_mou && (
              <small style={{ color: '#666' }}>
                File saat ini: {form.dokumen_mou}
              </small>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Batal
            </button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
