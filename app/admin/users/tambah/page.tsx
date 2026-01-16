'use client';

import { useState } from 'react';
import api from '@/lib/axios';

export default function TambahUser({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    const payload: any = {
      nama_lengkap: form.nama_lengkap.value,
      email: form.email.value,
      password: form.password.value,
      role: form.role.value,
      status: form.status.value,
    };

    // khusus kontraktor
    if (form.role.value === 'kontraktor') {
      payload.is_premium = form.is_premium.checked ? 1 : 0;
    }

    try {
      await api.post('/api/admin/users', payload); // 🔹 endpoint diperbaiki
      onClose();
      setTimeout(() => location.reload(), 300);
    } catch (err: any) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || 'Gagal menambahkan user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Tambah User</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input name="nama_lengkap" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" autoComplete="new-email" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" autoComplete="new-password" required />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" required>
              <option value="">Pilih Role</option>
              <option value="kontraktor">Kontraktor</option>
              <option value="pemilik">Pemilik</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" required>
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input type="checkbox" name="is_premium" />
              &nbsp;VIP (Khusus Kontraktor)
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
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
