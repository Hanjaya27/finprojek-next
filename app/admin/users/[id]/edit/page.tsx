'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    role: 'kontraktor',
    status: 'aktif',
    is_premium: 0,
  });

  useEffect(() => {
    api.get(`/api/admin/users/${id}`)
      .then(res => {
        setForm({
          nama_lengkap: res.data.nama_lengkap,
          email: res.data.email,
          role: res.data.role,
          status: res.data.status,
          is_premium: res.data.is_premium,
        });
      })
      .catch(() => alert('Gagal memuat data pengguna'));
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/api/admin/users/${id}`, form);
      router.push('/admin/users');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal update pengguna');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Pengguna</h2>
          <button
            className="modal-close"
            onClick={() => router.push('/admin/users')}
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
            <label>Role</label>
            <select
              value={form.role}
              onChange={e =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="kontraktor">Kontraktor</option>
              <option value="pemilik">Pemilik</option>
            </select>
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

          {form.role === 'kontraktor' && (
            <div className="form-group">
              <label>Keanggotaan</label>
              <select
                value={form.is_premium}
                onChange={e =>
                  setForm({
                    ...form,
                    is_premium: Number(e.target.value),
                  })
                }
              >
                <option value={0}>Gratis</option>
                <option value={1}>VIP</option>
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/admin/users')}
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
