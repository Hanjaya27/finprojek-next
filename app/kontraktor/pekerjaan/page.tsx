'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import TambahPekerjaanModal from './TambahPekerjaan';
import EditPekerjaanModal from './EditPekerjaan';
import { useRouter } from 'next/navigation';

type Job = {
  id_pekerjaan: number;
  nama_pekerjaan: string;
  id_proyek: number;
  nama_proyek: string;
  progress: number;
  sub_pekerjaan: number;
};

export default function PekerjaanPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    api.get('/api/pekerjaan').then(res => setJobs(res.data));
    api.get('/api/proyek').then(res => setProjects(res.data));
  }, []);

  const filteredJobs =
    selectedProject === 'all'
      ? jobs
      : jobs.filter(j => j.id_proyek === selectedProject);

  const getMenuPosition = (rect: DOMRect) => {
    const WIDTH = 150;
    const GAP = 8;
    let x = rect.right + GAP;
    if (x + WIDTH > window.innerWidth) {
      x = rect.left - WIDTH - GAP;
    }
    return { x, y: rect.top };
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [openMenuId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pekerjaan ini?')) return;
    await api.delete(`/api/pekerjaan/${id}`);
    setJobs(prev => prev.filter(j => j.id_pekerjaan !== id));
    setOpenMenuId(null);
  };

  return (
    <main className="main-content">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Manajemen Pekerjaan</h1>
          <p>Kelola semua pekerjaan dalam proyek Anda</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="filter-card">
        <select
          className="filter-input"
          value={selectedProject}
          onChange={e =>
            setSelectedProject(
              e.target.value === 'all'
                ? 'all'
                : Number(e.target.value)
            )
          }
        >
          <option value="all">Semua Proyek</option>
          {projects.map(p => (
            <option key={p.id_proyek} value={p.id_proyek}>
              {p.nama_proyek}
            </option>
          ))}
        </select>

        <button
          className="btn-primary"
          onClick={() => setShowTambahModal(true)}
        >
          + Tambah Pekerjaan
        </button>
      </div>

      {/* TABLE (SCROLLABLE) */}
      <div className="table-card">
        <div className="table-scroll">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Pekerjaan</th>
                <th>Proyek</th>
                <th>Progress</th>
                <th>Sub</th>
                <th className="center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    Tidak ada pekerjaan
                  </td>
                </tr>
              ) : (
                filteredJobs.map(j => (
                  <tr key={j.id_pekerjaan}>
                    <td className="title">{j.nama_pekerjaan}</td>
                    <td>{j.nama_proyek}</td>

                    <td>
                      <div className="progress-wrapper">
                        <div className="progress-text">
                          {Math.round(j.progress)}%
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${j.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-gray">
                        {j.sub_pekerjaan} item
                      </span>
                    </td>

                    <td className="center">
                      <button
                        className="action-btn"
                        onClick={e => {
                          setMenuPos(
                            getMenuPosition(
                              e.currentTarget.getBoundingClientRect()
                            )
                          );
                          setOpenMenuId(j.id_pekerjaan);
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
      </div>

      {/* ACTION MENU */}
      {openMenuId && menuPos && (
        <div
          ref={menuRef}
          className="dropdown-menu popup"
          style={{
            top: menuPos.y,
            left: menuPos.x,
            position: 'fixed',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() =>
              router.push(
                `/kontraktor/pekerjaan/${openMenuId}/sub-pekerjaan`
              )
            }
          >
            Sub Pekerjaan
          </button> 

          <button
            onClick={() =>
              router.push(`/kontraktor/pekerjaan/${openMenuId}`)
            }
          >
            Detail
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
      {showTambahModal && (
        <TambahPekerjaanModal
          onClose={() => setShowTambahModal(false)}
          onSuccess={() => {
            setShowTambahModal(false);
            api.get('/api/pekerjaan').then(res => setJobs(res.data));
          }}
        />
      )}

      {editId && (
        <EditPekerjaanModal
          id={editId}
          onClose={() => setEditId(null)}
        />
      )}
    </main>
  );
}
