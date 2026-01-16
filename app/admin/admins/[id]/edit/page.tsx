'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function EditAdminPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    status: 'aktif',
  });

  useEffect(() => {
    // Memanggil API yang benar untuk satu admin
    api.get(`/api/admin/admins/${id}`)
      .then(res => {
        setForm({
          nama_lengkap: res.data.nama_lengkap,
          email: res.data.email,
          status: res.data.status,
        });
      })
      .catch(() => alert('Gagal memuat data admin'));
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/api/admin/admins/${id}`, form);
      router.push('/admin/admins');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal update admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Admin</h2>
          <button
            className="modal-close"
            onClick={() => router.push('/admin/admins')}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              value={form.nama_lengkap}
              onChange={e =>
                setForm({ ...form, nama_lengkap: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={form.email} disabled />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={e =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/admin/admins')}
            >
              Batal
            </button>

            <button
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
