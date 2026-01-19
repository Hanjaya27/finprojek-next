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
  total: number;
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
    api.get('/pengeluaran').then(res => {
      const list = res.data.data ?? res.data;
      setData(
        list.map((p: any) => ({
          ...p,
          id_pengeluaran: Number(p.id_pengeluaran),
          id_proyek: Number(p.id_proyek),
          id_pekerjaan: p.id_pekerjaan ? Number(p.id_pekerjaan) : undefined,
          total: Number(p.total ?? 0),
          tgl_transaksi: p.tgl_transaksi ?? null,
        }))
      );
    });

    api.get('/proyek').then(res => {
      const list = res.data.data ?? res.data;
      setProjects(list.map((p: any) => ({ ...p, id_proyek: Number(p.id_proyek) })));
    });

    api.get('/pekerjaan').then(res => {
      const list = res.data.data ?? res.data;
      setJobs(
        list.map((j: any) => ({
          ...j,
          id_pekerjaan: Number(j.id_pekerjaan),
          id_proyek: Number(j.id_proyek),
        }))
      );
    });
  }, []);

  /* ================= FILTER ================= */
  const filteredJobs =
    selectedProject === 'all'
      ? []
      : jobs.filter(j => j.id_proyek === selectedProject);

  const filteredData = data.filter(d => {
    if (selectedProject !== 'all' && d.id_proyek !== selectedProject) return false;

    if (selectedJob !== 'all') {
      if (!d.id_pekerjaan) return false;
      if (d.id_pekerjaan !== selectedJob) return false;
    }

    return true;
  });

  /* ================= RENDER ================= */
  return (
    <main className="main-content">
      <div className="filter-card">
        <select
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
          value={selectedJob}
          disabled={selectedProject === 'all'}
          onChange={e =>
            setSelectedJob(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
        >
          <option value="all">
            {selectedProject === 'all' ? 'Pilih proyek dulu' : 'Semua pekerjaan'}
          </option>
          {filteredJobs.map(j => (
            <option key={j.id_pekerjaan} value={j.id_pekerjaan}>
              {j.nama_pekerjaan}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE SAMA SEPERTI PUNYA KAMU */}
    </main>
  );
}
