'use client';

import { useState, FormEvent } from 'react';

interface GabungProyekModalProps {
  onClose: () => void;
  onSuccess: (proyek: any) => void;
}

export default function GabungProyekModal({ onClose, onSuccess }: GabungProyekModalProps) {
  const [kodeProyek, setKodeProyek] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kodeProyek) {
      setErrorMsg('Kode proyek wajib diisi');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
        setErrorMsg('Sesi habis, silakan login ulang');
        return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/pemilik/proyek/gabung`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ kode_proyek: kodeProyek }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Kode proyek tidak ditemukan atau valid.');
      }

      alert('Berhasil bergabung ke proyek!');
      onSuccess(data.proyek); // Update list di halaman utama
      onClose(); // Tutup modal

    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal gabung proyek');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
      <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Gabung Proyek</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Kode Proyek</label>
            <input
              type="text"
              value={kodeProyek}
              onChange={(e) => setKodeProyek(e.target.value)}
              placeholder="Contoh: PRJ-12345"
              className="form-control"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              required
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>*Kode diberikan oleh kontraktor</small>
          </div>

          {errorMsg && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {errorMsg}
            </div>
          )}

          <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button 
                type="submit"
                className="btn btn-primary" 
                disabled={loading}
            >
              {loading ? 'Memproses...' : 'Gabung'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}