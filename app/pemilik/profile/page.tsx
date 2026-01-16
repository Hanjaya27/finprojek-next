'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserProfile = {
  nama_lengkap: string;
  email: string | null;
  no_telepon: string | null;
  foto_profil: string | null;
};

export default function ProfilePemilikPage() {
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
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/pemilik/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error('Unauthorized');

      const data: UserProfile = await res.json();

      setForm({
        nama_lengkap: data.nama_lengkap,
        email: data.email ?? '',
        no_telepon: data.no_telepon ?? '',
        password: '',
        foto_profil: null,
      });

      if (data.foto_profil) {
        setPreview(`http://localhost:8000/storage/${data.foto_profil}`);
      }

      setLoading(false);
    } catch {
      localStorage.clear();
      router.push('/auth/login');
    }
  };

  /* ================= HANDLER ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB');
      return;
    }

    setForm(prev => ({ ...prev, foto_profil: file }));
    setPreview(URL.createObjectURL(file));
  };

/* ================= UPDATE ================= */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const fd = new FormData();
  fd.append('nama_lengkap', form.nama_lengkap);
  fd.append('email', form.email);
  fd.append('no_telepon', form.no_telepon);
  if (form.password) fd.append('password', form.password);
  if (form.foto_profil) fd.append('foto_profil', form.foto_profil);

  const res = await fetch('http://localhost:8000/api/pemilik/profile', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });

  if (!res.ok) {
    alert('Gagal memperbarui profil');
    return;
  }

  const result = await res.json();

  // 🔥 INI KUNCI UTAMANYA
  localStorage.setItem('user', JSON.stringify(result.data));

  alert('Profil berhasil diperbarui');

  // refresh state profile page
  fetchProfile(token);
};



  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus akun?')) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    await fetch('http://localhost:8000/api/pemilik/profile', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.clear();
    router.push('/auth/login');
  };

  if (loading) return <p className="main-content">Loading...</p>;

  /* ================= VIEW ================= */
  return (
    <main className="main-content">
      <div className="profile-wrapper">
        <h1 className="title">Profil Pemilik</h1>

        <form onSubmit={handleSubmit} className="profile-card">
          <div className="avatar-wrapper">
            <img src={preview || '/avatar.png'} alt="Foto Profil" />
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          <input
            name="nama_lengkap"
            value={form.nama_lengkap}
            onChange={handleChange}
            placeholder="Nama Lengkap"
            required
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
          />

          <input
            name="no_telepon"
            value={form.no_telepon}
            onChange={handleChange}
            placeholder="No Telepon"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password Baru (opsional)"
          />

          <button className="btn-primary">Simpan</button>
        </form>

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn-outline">
            Logout
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Hapus Akun
          </button>
        </div>
      </div>
    </main>
  );
}
