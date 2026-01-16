'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id_user: number;
  nama_lengkap: string;
  email: string;
  role: 'kontraktor' | 'pemilik';
  status: 'aktif' | 'tidak aktif';
  is_premium: number;
};

export default function UserAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] =
    useState<'all' | User['role']>('all');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const router = useRouter();

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;

  const loadUsers = async () => {
    const res = await fetch('http://localhost:8000/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUsers(data.filter((u: any) => u.role !== 'admin'));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;

    await fetch(`http://localhost:8000/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setOpenMenuId(null);
    loadUsers();
  };

  const filteredUsers =
    selectedRole === 'all'
      ? users
      : users.filter(u => u.role === selectedRole);

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
          <h1>Manajemen Pengguna</h1>
          <p style={{ color: '#777' }}>
            Kelola kontraktor & pemilik proyek
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select
            className="input"
            style={{ width: 180 }}
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value as any)
            }
          >
            <option value="all">Semua Role</option>
            <option value="kontraktor">Kontraktor</option>
            <option value="pemilik">Pemilik</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={() => router.push('/admin/users/tambah')}
          >
            + Tambah Pengguna
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>VIP</th>
              <th style={{ textAlign: 'center', width: 80 }}>
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  Tidak ada data
                </td>
              </tr>
            )}

            {filteredUsers.map(u => (
              <tr key={u.id_user}>
                <td>{u.nama_lengkap}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  {u.role === 'kontraktor'
                    ? u.is_premium === 1
                      ? 'VIP'
                      : 'Gratis'
                    : '-'}
                </td>

                <td style={{ textAlign: 'center', position: 'relative' }}>
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === u.id_user
                          ? null
                          : u.id_user
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

                  {openMenuId === u.id_user && (
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
                      }}
                    >
                      <div
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          router.push(
                            `/admin/users/${u.id_user}/edit`
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
                        onClick={() => deleteUser(u.id_user)}
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
