'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Props = {
  onClose?: () => void; // optional: modal / page
};

export default function TambahAdmin({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose(); // modal
    } else {
      router.push('/admin/admins'); // page
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('role', 'admin'); // paksa admin

    try {
      await api.post('/api/admin/admins', formData);
      alert('Admin berhasil ditambahkan');
      handleClose(); // ⬅️ NAVIGASI BENAR
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          'Gagal menambahkan admin'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tambah Admin</h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              name="nama_lengkap"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
                type="email"
                name="email"
                autoComplete="new-email"
                required
              />

          </div>

          <div className="form-group">
            <label>Password</label>
            <input
                type="password"
                name="password"
                autoComplete="new-password"
                required
              />

          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" required>
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">
                Tidak Aktif
              </option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Batal
            </button>

            <button
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
