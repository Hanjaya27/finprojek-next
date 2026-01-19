'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import TambahPengeluaranModal from './TambahPengeluaran';
import { useRouter } from 'next/navigation';

type Pengeluaran = {
  id_pengeluaran: number;
  no_nota: string;
  tgl_transaksi: string | null;
  spesifikasi: 'Material' | 'Tenaga';
  id_proyek: number;
  nama_proyek: string;
  id_pekerjaan?: number;
  nama_pekerjaan?: string;
  total?: number | null;
};

export default function PengeluaranPage() {
  const [data, setData] = useState<Pengeluaran[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');
  const [selectedJob, setSelectedJob] = useState<number | 'all'>('all');

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [showTambahModal, setShowTambahModal] = useState(false);
  const router = useRouter();

  /* ================= FETCH ================= */
  useEffect(() => {
    api.get('/pengeluaran')
      .then(res => {
        const list = res.data.data ?? res.data;
        const normalized = list.map((p: any) => ({
          ...p,
          total: p.total ?? 0,
          tgl_transaksi: p.tgl_transaksi ?? null,
        }));
        setData(normalized);
      })
      .catch(err => {
        console.error('Gagal ambil pengeluaran:', err.response?.data || err);
      });

    api.get('/proyek')
      .then(res => setProjects(res.data.data ?? res.data))
      .catch(err => console.error('Gagal ambil proyek:', err));

    api.get('/pekerjaan')
      .then(res => setJobs(res.data.data ?? res.data))
      .catch(err => console.error('Gagal ambil pekerjaan:', err));
  }, []);

  /* ================= FILTER ================= */
  const filteredJobs =
    selectedProject === 'all'
      ? []
      : jobs.filter(j => j.id_proyek === selectedProject);

  const filteredData = data.filter(d => {
    if (selectedProject !== 'all' && d.id_proyek !== selectedProject) return false;
    if (selectedJob !== 'all' && d.id_pekerjaan !== selectedJob) return false;
    return true;
  });

  /* ================= POPUP ================= */
  const getMenuPosition = (rect: DOMRect) => {
    const WIDTH = 130;
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
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return;

    try {
      await api.delete(`/pengeluaran/${id}`);
      setData(prev => prev.filter(p => p.id_pengeluaran !== id));
      setOpenMenuId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus pengeluaran');
    }
  };

  return (
    <main className="main-content">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Manajemen Pengeluaran</h1>
          <p>Catat dan kelola pengeluaran proyek</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="filter-card">
        <select
          className="filter-input"
          value={selectedProject}
          onChange={e => {
            const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
            setSelectedProject(val);
            setSelectedJob('all');
          }}
        >
          <option value="all">Semua Proyek</option>
          {projects.map(p => (
            <option key={p.id_proyek} value={p.id_proyek}>
              {p.nama_proyek}
            </option>
          ))}
        </select>

        <select
          className="filter-input"
          disabled={selectedProject === 'all'}
          value={selectedJob}
          onChange={e =>
            setSelectedJob(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
        >
          <option value="all">
            {selectedProject === 'all'
              ? 'Pilih proyek dulu'
              : 'Semua pekerjaan'}
          </option>
          {filteredJobs.map(j => (
            <option key={j.id_pekerjaan} value={j.id_pekerjaan}>
              {j.nama_pekerjaan}
            </option>
          ))}
        </select>

        <button className="btn-primary" onClick={() => setShowTambahModal(true)}>
          + Tambah
        </button>
      </div>

      {/* TABLE */}
      <div className="table-card" style={{ maxHeight: '65vh', overflow: 'hidden' }}>
        <table className="modern-table">
          <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
            <tr>
              <th>No Nota</th>
              <th>Tanggal</th>
              <th>Proyek</th>
              <th>Spesifikasi</th>
              <th className="right">Total</th>
              <th className="center">Aksi</th>
            </tr>
          </thead>
        </table>

        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          <table className="modern-table">
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredData.map(p => (
                  <tr key={p.id_pengeluaran}>
                    <td>{p.no_nota}</td>
                    <td>
                      {p.tgl_transaksi
                        ? new Date(p.tgl_transaksi).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td>{p.nama_proyek}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.spesifikasi === 'Material'
                            ? 'badge-blue'
                            : 'badge-green'
                        }`}
                      >
                        {p.spesifikasi}
                      </span>
                    </td>
                    <td className="right">
                      Rp {Number(p.total).toLocaleString('id-ID')}
                    </td>
                    <td className="center">
                      <button
                        className="action-btn"
                        onClick={e => {
                          setMenuPos(getMenuPosition(e.currentTarget.getBoundingClientRect()));
                          setOpenMenuId(p.id_pengeluaran);
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

      {/* POPUP */}
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
          <button onClick={() => router.push(`/kontraktor/pengeluaran/detail/${openMenuId}`)}>
            Detail
          </button>
          <button onClick={() => router.push(`/kontraktor/pengeluaran/edit/${openMenuId}`)}>
            Edit
          </button>
          <button className="danger" onClick={() => handleDelete(openMenuId)}>
            Hapus
          </button>
        </div>
      )}

      {showTambahModal && (
        <TambahPengeluaranModal onClose={() => setShowTambahModal(false)} />
      )}
    </main>
  );
}
