'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Admin = {
  id_user: number;
  nama_lengkap: string;
  email: string;
  status: 'aktif' | 'tidak aktif';
};

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const router = useRouter();

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;

  const loadAdmins = async () => {
    const res = await fetch('http://localhost:8000/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    // ⬇️ FILTER KHUSUS ADMIN
    setAdmins(data.filter((u: any) => u.role === 'admin'));
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const deleteAdmin = async (id: number) => {
    if (!confirm('Hapus admin ini?')) return;

    await fetch(`http://localhost:8000/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setOpenMenuId(null);
    loadAdmins();
  };

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
        <table style={{ width: '100%' }}>
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
            {admins.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Tidak ada admin
                </td>
              </tr>
            )}

            {admins.map(a => (
              <tr key={a.id_user}>
                <td>{a.nama_lengkap}</td>
                <td>{a.email}</td>
                <td>{a.status}</td>

                {/* AKSI TITIK 3 */}
                <td
                  style={{
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === a.id_user
                          ? null
                          : a.id_user
                      )
                    }
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: 20,
                      cursor: 'pointer',
                    }}
                  >
                    ⋮
                  </button>

                  {openMenuId === a.id_user && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 20,
                        top: 30,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        boxShadow:
                          '0 4px 10px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          router.push(
                            `/admin/admins/${a.id_user}/edit`
                          )
                        }
                      >
                        ✏️ Edit
                      </div>

                      <div
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          color: 'red',
                        }}
                        onClick={() =>
                          deleteAdmin(a.id_user)
                        }
                      >
                        🗑️ Hapus
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
