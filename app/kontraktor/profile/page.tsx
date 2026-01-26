'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; // Gunakan Axios helper

// URL Storage untuk menampilkan gambar dari server
const STORAGE_URL = 'https://api.finprojek.web.id/storage/';

type UserProfile = {
  nama_lengkap: string;
  email: string | null;
  no_telepon: string | null;
  foto_profil: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    password: '',
    foto_profil: null as File | null,
  });

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      
      // Handle Wrapper (jaga-jaga ada .data pembungkus)
      const data: UserProfile = res.data.data || res.data;

      setForm(prev => ({
        ...prev,
        nama_lengkap: data.nama_lengkap,
        email: data.email ?? '',
        no_telepon: data.no_telepon ?? '',
        password: '', // Reset password field
        foto_profil: null,
      }));

      // Set Preview Gambar
      if (data.foto_profil) {
        // Cek apakah URL sudah full path atau relative
        if (data.foto_profil.startsWith('http')) {
            setPreview(data.foto_profil);
        } else {
            setPreview(`${STORAGE_URL}${data.foto_profil}`);
        }
      } else {
        setPreview(null);
      }

    } catch (err) {
      console.error("Gagal load profile:", err);
      // Jika error 401 (Unauthorized), redirect ke login
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= HANDLER INPUT ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi Tipe
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validasi Ukuran (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB');
      return;
    }

    setForm({ ...form, foto_profil: file });
    setPreview(URL.createObjectURL(file));
  };

  /* ================= UPDATE PROFILE ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('nama_lengkap', form.nama_lengkap);
    fd.append('email', form.email);
    
    // Kirim no_telepon hanya jika ada isinya
    if (form.no_telepon) fd.append('no_telepon', form.no_telepon);
    
    // Kirim password hanya jika diisi
    if (form.password) fd.append('password', form.password);
    
    // Kirim foto jika ada yang baru
    if (form.foto_profil) fd.append('foto_profil', form.foto_profil);

    // [TIPS] Jika backend route-nya 'PUT', tapi kita kirim file (Multipart),
    // Laravel kadang butuh kita kirim POST dengan _method: PUT
    // fd.append('_method', 'PUT'); // Aktifkan baris ini jika backend pakai Route::put

    try {
      await api.post('/profile', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Profil berhasil diperbarui');
      
      // Refresh data profil agar sinkron
      fetchProfile();
      
      // Kosongkan password field di UI
      setForm(prev => ({ ...prev, password: '' }));

    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Gagal memperbarui profil';
      alert(msg);
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
        await api.post('/logout'); // Request logout ke backend (opsional)
    } catch (e) {
        // ignore error
    }
    localStorage.clear(); // Hapus token
    router.push('/auth/login');
  };

  /* ================= DELETE ACCOUNT ================= */
  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus akun? Data tidak bisa dikembalikan.')) return;

    try {
      await api.delete('/profile'); // Pastikan route backend mendukung DELETE /profile
      localStorage.clear();
      alert('Akun berhasil dihapus.');
      router.push('/auth/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus akun');
    }
  };

  if (loading) return <p className="main-content">Loading data profil...</p>;

  /* ================= VIEW ================= */
  return (
    <main className="main-content">
      <div className="profile-wrapper" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 className="title">Profil Pengguna</h1>

        <form onSubmit={handleSubmit} className="card profile-card" style={{ padding: 24 }}>
          
          {/* FOTO PROFIL */}
          <div className="avatar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ 
                width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', 
                border: '3px solid #eee', marginBottom: 10, position: 'relative'
            }}>
                <img 
                    src={preview || '/avatar-placeholder.png'} 
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                        // Fallback jika gambar error
                        (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + form.nama_lengkap;
                    }}
                />
            </div>
            
            <label style={{ cursor: 'pointer', color: '#007bff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Ganti Foto
                <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Nama Lengkap</label>
            <input
              name="nama_lengkap"
              className="form-control" style={{ width: '100%', padding: 10 }}
              value={form.nama_lengkap}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Email</label>
            <input
              name="email"
              className="form-control" style={{ width: '100%', padding: 10, background: '#f5f5f5' }}
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              readOnly // Biasanya email tidak boleh diganti sembarangan
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>No Telepon</label>
            <input
              name="no_telepon"
              className="form-control" style={{ width: '100%', padding: 10 }}
              value={form.no_telepon}
              onChange={handleChange}
              placeholder="No Telepon"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Password Baru (Opsional)</label>
            <input
              type="password"
              name="password"
              className="form-control" style={{ width: '100%', padding: 10 }}
              value={form.password}
              onChange={handleChange}
              placeholder="Isi jika ingin mengganti password"
              autoComplete="new-password"
            />
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: 12 }}>Simpan Perubahan</button>
        </form>

        <div className="profile-actions" style={{ marginTop: 30, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleLogout} className="btn-outline" style={{ padding: '10px 20px' }}>
            Logout
          </button>
          <button onClick={handleDelete} className="btn-danger" style={{ padding: '10px 20px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6 }}>
            Hapus Akun
          </button>
        </div>
      </div>
    </main>
  );
}