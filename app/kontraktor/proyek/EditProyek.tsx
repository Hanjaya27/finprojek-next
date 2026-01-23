'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface EditProyekModalProps {
  id: number;
  onClose: () => void;
}

export default function EditProyekModal({ id, onClose }: EditProyekModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // FETCH DATA SAAT MODAL DIBUKA
  useEffect(() => {
    // PERBAIKAN 1: Hapus "/api" di depan url
    api.get(`/proyek/${id}`)
      .then(res => {
        // PERBAIKAN 2: Ambil data dari dalam wrapper (res.data.data)
        // Jika backend tidak pakai wrapper, fallback ke res.data
        setForm(res.data.data || res.data);
      })
      .catch(err => {
        console.error("Gagal ambil data:", err);
        alert('Gagal mengambil data proyek');
        onClose();
      });
  }, [id, onClose]);

  if (!form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      // Teknik Spoofing PUT untuk Laravel (Wajib jika kirim file via FormData)
      fd.append('_method', 'PUT');

      fd.append('nama_proyek', form.nama_proyek);
      fd.append('lokasi', form.lokasi || '');
      fd.append('biaya_kesepakatan', String(form.biaya_kesepakatan));
      
      // Pastikan format tanggal YYYY-MM-DD
      fd.append('tgl_mulai', form.tgl_mulai ?? '');
      fd.append('tgl_selesai', form.tgl_selesai ?? '');
      
      fd.append('status', form.status);

      // Hanya append jika ada file baru yang dipilih
      if (form.mou_baru) {
        fd.append('dokumen_mou', form.mou_baru);
      }

      // PERBAIKAN 3: Pastikan URL POST juga tanpa "/api" manual
      await api.post(`/proyek/${id}`, fd, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
      });

      alert('Proyek berhasil diperbarui!');
      onClose();
      window.location.reload(); // Refresh halaman agar data terupdate
      
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 403) {
        alert('Masa trial Anda sudah habis atau Anda tidak memiliki akses.');
        onClose();
        router.push('/kontraktor/upgrade');
        return;
      }

      console.error(err);
      alert(err.response?.data?.message || 'Gagal memperbarui proyek.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
      <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ margin: 0 }}>Edit Proyek</h2>
          <button className="modal-close" onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nama Proyek</label>
            <input
              className="form-control"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={form.nama_proyek || ''}
              onChange={e =>
                setForm({ ...form, nama_proyek: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Lokasi Proyek</label>
            <input
              className="form-control"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={form.lokasi || ''}
              onChange={e =>
                setForm({ ...form, lokasi: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Biaya Kesepakatan</label>
            <input
              className="form-control"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              type="number"
              value={Number(form.biaya_kesepakatan) || 0}
              onChange={e =>
                setForm({
                  ...form,
                  biaya_kesepakatan: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px' }}>Tanggal Mulai</label>
                <input
                type="date"
                className="form-control"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={form.tgl_mulai || ''}
                onChange={e =>
                    setForm({ ...form, tgl_mulai: e.target.value })
                }
                />
            </div>

            <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px' }}>Tanggal Selesai</label>
                <input
                type="date"
                className="form-control"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={form.tgl_selesai || ''}
                onChange={e =>
                    setForm({ ...form, tgl_selesai: e.target.value })
                }
                />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Status Proyek</label>
            <select
              className="form-control"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={form.status || 'Berjalan'}
              onChange={e =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="Berjalan">Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Ditunda">Ditunda</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Update Dokumen MOU (Opsional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e =>
                // Simpan file baru ke state 'mou_baru' agar tidak menimpa string 'dokumen_mou' lama
                setForm({ ...form, mou_baru: e.target.files?.[0] })
              }
            />
            {form.dokumen_mou && !form.mou_baru && (
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                *Dokumen saat ini sudah ada. Upload baru untuk mengganti.
              </small>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
                type="button" 
                onClick={onClose}
                className="btn"
                style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Batal
            </button>
            <button 
                className="btn btn-primary" 
                disabled={loading}
                style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {loading ? 'Menyimpan...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}