'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; // ✅ Gunakan Axios Helper

type Admin = {
  id_user: number;
  nama_lengkap: string;
  email: string;
  role: string; // Tambahkan role untuk filter
  status: 'aktif' | 'tidak aktif';
};

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ================= LOAD ADMINS ================= */
  const loadAdmins = async () => {
    try {
      // 1. Gunakan api.get (Otomatis Base URL & Token)
      const res = await api.get('/admin/users');

      // 2. Handle Wrapper (.data atau .data.data)
      const rawData = res.data.data || res.data;
      const list = Array.isArray(rawData) ? rawData : [];

      // 3. Filter Khusus Role 'admin'
      const adminList = list.filter((u: any) => u.role === 'admin');
      
      setAdmins(adminList);
    } catch (err) {
      console.error("Gagal load admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  /* ================= DELETE ADMIN ================= */
  const deleteAdmin = async (id: number) => {
    if (!confirm('Yakin ingin menghapus admin ini?')) return;

    try {
      // Gunakan api.delete
      await api.delete(`/admin/users/${id}`);
      
      alert('Admin berhasil dihapus');
      setOpenMenuId(null);
      loadAdmins(); // Refresh data
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus admin');
    }
  };

  if (loading) return <p className="main-content" style={{marginLeft: '260px'}}>Loading data admin...</p>;

  return (
    <main
      className="main-content"
      style={{
        width: 'calc(100vw - 260px)',
        marginLeft: '260px',
        paddingRight: 24,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1>Kelola Admin</h1>
          <p style={{ color: '#777' }}>
            Manajemen akun administrator sistem
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => router.push('/admin/admins/tambah')}
        >
          + Tambah Admin
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="modern-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Status</th>
              <th style={{ textAlign: 'center', width: 80 }}>
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 20 }}>
                  Tidak ada data admin lain.
                </td>
              </tr>
            ) : (
              admins.map(a => (
                <tr key={a.id_user}>
                  <td style={{fontWeight: 500}}>{a.nama_lengkap}</td>
                  <td>{a.email}</td>
                  <td>
                    <span style={{
                        color: a.status === 'aktif' ? '#16a34a' : '#dc2626',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                    }}>
                        {a.status}
                    </span>
                  </td>

                  {/* AKSI TITIK 3 */}
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === a.id_user ? null : a.id_user)}
                      style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}
                    >
                      ⋮
                    </button>

                    {openMenuId === a.id_user && (
                      <>
                        {/* Overlay transparan untuk menutup menu saat klik luar */}
                        <div 
                            style={{position: 'fixed', inset: 0, zIndex: 99}} 
                            onClick={() => setOpenMenuId(null)}
                        />
                        
                        <div
                          style={{
                            position: 'absolute',
                            right: 20,
                            top: 30,
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            zIndex: 100,
                            minWidth: 120,
                            textAlign: 'left',
                            overflow: 'hidden'
                          }}
                        >
                          <button
                            style={{ display: 'block', width: '100%', padding: '10px 15px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}
                            onClick={() => router.push(`/admin/admins/${a.id_user}/edit`)}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            style={{ display: 'block', width: '100%', padding: '10px 15px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', color: '#dc2626', fontSize: '0.9rem', borderTop: '1px solid #eee' }}
                            onClick={() => deleteAdmin(a.id_user)}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </>
                    )}
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