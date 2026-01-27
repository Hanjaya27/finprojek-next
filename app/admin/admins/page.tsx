// 📂 File: src/app/admin/admins/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

type Admin = {
  id_user: number;
  nama_lengkap: string;
  email: string;
  role: string;
  status: 'aktif' | 'tidak aktif';
};

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAdmins = async () => {
    try {
      const res = await api.get('/admin/users');
      const rawData = res.data.data || res.data;
      const list = Array.isArray(rawData) ? rawData : [];
      setAdmins(list.filter((u: any) => u.role === 'admin'));
    } catch (err) {
      console.error("Gagal load admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const deleteAdmin = async (id: number) => {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      alert('Admin berhasil dihapus');
      setOpenMenuId(null);
      loadAdmins();
    } catch (err: any) {
      alert('Gagal menghapus admin');
    }
  };

  if (loading) return <p className="main-content" style={{marginLeft: '260px'}}>Loading...</p>;

  return (
    <main className="main-content" style={{width: 'calc(100vw - 260px)', marginLeft: '260px', paddingRight: 24}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1>Kelola Admin</h1>
        <button className="btn btn-primary" onClick={() => router.push('/admin/admins/tambah')}>
          + Tambah Admin
        </button>
      </div>

      <div className="card">
        <table className="modern-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Tidak ada admin lain.</td></tr>
            ) : (
              admins.map(a => (
                <tr key={a.id_user}>
                  <td>{a.nama_lengkap}</td>
                  <td>{a.email}</td>
                  <td>{a.status}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => deleteAdmin(a.id_user)} style={{color:'red'}}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}