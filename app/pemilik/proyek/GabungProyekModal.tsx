'use client';

import { useState } from 'react';

export default function GabungProyekModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (proyek: any) => void;
}) {
  const [kodeProyek, setKodeProyek] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!kodeProyek) {
      alert('Kode proyek wajib diisi');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(
        'http://localhost:8000/api/pemilik/proyek/gabung',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ kode_proyek: kodeProyek }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Berhasil bergabung ke proyek');
      onSuccess(data.proyek);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal gabung proyek');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Gabung Proyek</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kode Proyek</label>
            <input
              value={kodeProyek}
              onChange={e => setKodeProyek(e.target.value)}
              placeholder="Contoh: PRJxxxx"
              required
            />
            <small>*Kode diberikan oleh kontraktor</small>
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
              {loading ? 'Memproses...' : 'Gabung'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
