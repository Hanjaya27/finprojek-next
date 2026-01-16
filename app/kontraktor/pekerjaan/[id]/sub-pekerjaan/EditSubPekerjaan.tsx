'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

/* =========================
   TYPE PROPS
========================== */
type Props = {
  idSub: number;
  onClose: () => void;
  onSuccess: () => void; // ✅ TAMBAHAN WAJIB
};

type FormState = {
  nama_sub: string;
  tgl_mulai: string;
  keterangan: string;
};

export default function EditSubPekerjaanModal({
  idSub,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH DATA
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/sub-pekerjaan/${idSub}`);
        const sub = res.data.sub_pekerjaan;

        setForm({
          nama_sub: sub.nama_sub ?? '',
          tgl_mulai: sub.tgl_mulai ?? '',
          keterangan: sub.keterangan ?? '',
        });
      } catch (err) {
        console.error(err);
        alert('Gagal memuat data sub pekerjaan');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idSub, onClose]);

  if (loading || !form) return null;

  /* =========================
     SUBMIT
  ========================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.put(`/api/sub-pekerjaan/${idSub}`, {
        nama_sub: form.nama_sub,
        tgl_mulai: form.tgl_mulai || null,
        keterangan: form.keterangan,
      });

      onSuccess(); // ✅ BALIK KE PARENT (REFRESH DATA)
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate sub pekerjaan');
    }
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Sub Pekerjaan</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Sub Pekerjaan</label>
            <input
              value={form.nama_sub}
              onChange={e =>
                setForm({ ...form, nama_sub: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              value={form.tgl_mulai}
              onChange={e =>
                setForm({ ...form, tgl_mulai: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Keterangan (Opsional)</label>
            <textarea
              rows={3}
              value={form.keterangan}
              onChange={e =>
                setForm({ ...form, keterangan: e.target.value })
              }
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Batal
            </button>
            <button className="btn btn-primary" type="submit">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
