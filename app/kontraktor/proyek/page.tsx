'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import TambahProyekModal from './TambahProyek';
import EditProyekModal from './EditProyek';
import { useRouter } from 'next/navigation';

export default function ProyekPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  /* =========================
     FETCH PROYEK
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    api
      .get('/proyek') // ⬅️ interceptor otomatis pasang Authorization
      .then(res => {
        setProjects(res.data.data ?? res.data);
      })
      .catch(err => {
        console.error('Gagal ambil proyek:', err.response?.data || err);
      });
  }, []);

  /* =========================
     UTILS
  ========================== */
  const copyKode = async (kode: string) => {
    try {
      await navigator.clipboard.writeText(kode);
      alert(`Kode proyek "${kode}" berhasil disalin`);
    } catch {
      alert('Gagal menyalin kode');
    }
  };

  const getMenuPosition = (rect: DOMRect) => {
    const MENU_WIDTH = 150;
    const GAP = 8;
    const screenWidth = window.innerWidth;

    let x = rect.right + GAP;
    if (x + MENU_WIDTH > screenWidth) {
      x = rect.left - MENU_WIDTH - GAP;
    }

    return { x, y: rect.top };
  };

  /* =========================
     DELETE PROYEK
  ========================== */
  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus proyek ini?')) return;

    try {
      await api.delete(`/proyek/${id}`); // ⬅️ interceptor handle token
      setProjects(prev => prev.filter(p => p.id_proyek !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Proyek gagal dihapus');
    }
  };

  /* =========================
     CLOSE MENU OUTSIDE
  ========================== */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  return (
    <main className="main-content">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>Manajemen Proyek</h1>
          <p style={{ color: '#777' }}>Daftar proyek yang sedang kamu kelola</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Tambah Proyek
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kode</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Belum ada proyek
                </td>
              </tr>
            ) : (
              projects.map(p => (
                <tr key={p.id_proyek}>
                  <td>{p.nama_proyek}</td>
                  <td>
                    <code>{p.kode_proyek}</code>
                    <button onClick={() => copyKode(p.kode_proyek)}>📋</button>
                  </td>
                  <td>{p.status}</td>
                  <td>
                    <button
                      onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos(getMenuPosition(rect));
                        setOpenMenuId(p.id_proyek);
                      }}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DROPDOWN */}
      {openMenuId && menuPos && (
        <div
          ref={menuRef}
          className="dropdown-menu popup"
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          <button onClick={() => router.push(`/kontraktor/proyek/detail/${openMenuId}`)}>
            Detail
          </button>
          <button onClick={() => setEditId(openMenuId)}>Edit</button>
          <button className="danger" onClick={() => handleDelete(openMenuId)}>
            Hapus
          </button>
        </div>
      )}

      {showModal && <TambahProyekModal onClose={() => setShowModal(false)} />}
      {editId && <EditProyekModal id={editId} onClose={() => setEditId(null)} />}
    </main>
  );
}
