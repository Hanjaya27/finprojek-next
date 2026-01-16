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
     FETCH DATA
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem('token');
    api
      .get('/api/proyek', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
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

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus proyek ini?')) return;

    try {
      await api.delete(`/api/proyek/${id}`);
      setProjects(prev => prev.filter(p => p.id_proyek !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Proyek gagal dihapus');
    }
  };

  /* =========================
     CLOSE POPUP OUTSIDE
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Manajemen Proyek</h1>
          <p style={{ color: '#777', fontSize: 14 }}>
            Daftar proyek yang sedang kamu kelola
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Tambah Proyek
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="card" style={{ padding: 0 }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nama Proyek</th>
              <th>Kode</th>
              <th>Pemilik</th>
              <th>Status</th>
              <th style={{ width: 80, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>
                  <span style={{ color: '#777' }}>
                    Belum ada proyek
                  </span>
                </td>
              </tr>
            ) : (
              projects.map(p => (
                <tr key={p.id_proyek}>
                  <td>
                    <strong>{p.nama_proyek}</strong>
                  </td>

                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <code className="code-badge">{p.kode_proyek}</code>
                      <button
                        className="btn btn-icon"
                        title="Salin kode"
                        onClick={() => copyKode(p.kode_proyek)}
                      >
                        📋
                      </button>
                    </div>
                  </td>

                  <td>-</td>

                  <td>
                    <span
                      className={`status-badge ${
                        p.status === 'aktif' ? 'success' : 'secondary'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-icon"
                      onClick={e => {
                        const rect =
                          e.currentTarget.getBoundingClientRect();
                        setMenuPos(getMenuPosition(rect));
                        setOpenMenuId(
                          openMenuId === p.id_proyek ? null : p.id_proyek
                        );
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

      {/* DROPDOWN MENU */}
      {openMenuId && menuPos && (
        <div
          ref={menuRef}
          className="dropdown-menu popup"
          style={{
            top: menuPos.y,
            left: menuPos.x,
            width: 150,
          }}
        >
          <button
            onClick={() => {
              setOpenMenuId(null);
              router.push(`/kontraktor/proyek/detail/${openMenuId}`);
            }}
          >
            Lihat Detail
          </button>

          <button
            onClick={() => {
              setEditId(openMenuId);
              setOpenMenuId(null);
            }}
          >
            Edit
          </button>

          <button
            className="danger"
            onClick={() => handleDelete(openMenuId)}
          >
            Hapus
          </button>
        </div>
      )}

      {/* MODALS */}
      {showModal && <TambahProyekModal onClose={() => setShowModal(false)} />}

      {editId && (
        <EditProyekModal
          id={editId}
          onClose={() => setEditId(null)}
        />
      )}
    </main>
  );
}
