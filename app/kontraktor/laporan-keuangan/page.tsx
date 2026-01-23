'use client';

import { useEffect, useRef, useState } from 'react';
import api from '@/lib/axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function LaporanKeuanganPage() {
  const [proyek, setProyek] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const [filter, setFilter] = useState({
    id_proyek: '',
    start: '',
    end: ''
  });

  /* ================= FETCH ================= */
  const fetchData = async () => {
    if (!filter.id_proyek) return;

    const res = await api.get('/laporan-keuangan', { params: filter });
    setData(res.data);
  };

  useEffect(() => {
    api.get('/proyek').then(res => setProyek(res.data));
  }, []);

  /* ================= CLOSE EXPORT ================= */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  /* ================= UTIL ================= */
  const breakdownPercent = (value: number) => {
    if (!data || Number(data.total_pengeluaran) === 0) return '0.00';
    return ((value / data.total_pengeluaran) * 100).toFixed(2);
  };

  const getNamaProyek = () => {
    const p = proyek.find(p => p.id_proyek == filter.id_proyek);
    return p ? p.nama_proyek : 'Proyek';
  };

  const downloadFile = (blobData: Blob, filename: string, type: string) => {
    const blob = new Blob([blobData], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = async () => {
    const res = await api.get('/laporan-keuangan/export/excel', {
      params: { id_proyek: filter.id_proyek },
      responseType: 'blob'
    });

    downloadFile(
      res.data,
      `Laporan Keuangan - ${getNamaProyek()}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  const exportPdf = async () => {
    const res = await api.get('/laporan-keuangan/export/pdf', {
      params: { id_proyek: filter.id_proyek },
      responseType: 'blob'
    });

    downloadFile(
      res.data,
      `Laporan Keuangan - ${getNamaProyek()}.pdf`,
      'application/pdf'
    );
  };

  return (
    <main className="main-content">
      {/* ================= HEADER ================= */}
      <div className="flex-between mb-4">
        <div>
          <h1>Laporan Keuangan</h1>
          <p style={{ color: '#6b7280' }}>
            Ringkasan pengeluaran proyek
          </p>
        </div>
      </div>

      {/* ================= FILTER (FINAL FIX) ================= */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center'
        }}
      >
        <select
          style={selectStyle}
          value={filter.id_proyek}
          onChange={e =>
            setFilter({
              id_proyek: e.target.value,
              start: '',
              end: ''
            })
          }
        >
          <option value="">Pilih Proyek</option>
          {proyek.map(p => (
            <option key={p.id_proyek} value={p.id_proyek}>
              {p.nama_proyek}
            </option>
          ))}
        </select>

        <input
          type="date"
          style={dateStyle}
          value={filter.start}
          onChange={e =>
            setFilter({ ...filter, start: e.target.value })
          }
        />

        <input
          type="date"
          style={dateStyle}
          value={filter.end}
          onChange={e =>
            setFilter({ ...filter, end: e.target.value })
          }
        />

        <button
          className="btn btn-primary"
          onClick={fetchData}
        >
          Terapkan
        </button>

        {filter.id_proyek && (
          <div ref={exportRef} style={{ position: 'relative' }}>
            <button
              className="btn btn-outline"
              onClick={() => setShowExport(!showExport)}
            >
              Export ▾
            </button>

            {showExport && (
              <div style={exportPopup}>
                <button
                  style={exportItem}
                  onClick={() => {
                    exportExcel();
                    setShowExport(false);
                  }}
                >
                  📊 Export Excel
                </button>
                <button
                  style={exportItem}
                  onClick={() => {
                    exportPdf();
                    setShowExport(false);
                  }}
                >
                  📄 Export PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {data && (
        <>
          {/* ================= SUMMARY ================= */}
          <div className="grid grid-3 gap-3 mt-4">
            <Summary title="Total Anggaran" value={data.proyek.biaya_kesepakatan} />
            <Summary title="Total Pengeluaran" value={data.total_pengeluaran} />
            <Summary title="Sisa Anggaran" value={data.sisa_anggaran} />
          </div>

          {/* ================= CHART ================= */}
          <div className="grid grid-4 gap-3 mt-4">
            <div className="card" style={{ gridColumn: 'span 3' }}>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tgl_transaksi" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="total"
                      stroke="#395A7F"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <Breakdown
                title="Material"
                value={data.total_material}
                percent={breakdownPercent(data.total_material)}
              />
              <hr />
              <Breakdown
                title="Tenaga"
                value={data.total_tenaga}
                percent={breakdownPercent(data.total_tenaga)}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

/* ================= COMPONENT ================= */
const Summary = ({ title, value }: any) => (
  <div className="card">
    <h4>{title}</h4>
    <strong>Rp {Number(value).toLocaleString('id-ID')}</strong>
  </div>
);

const Breakdown = ({ title, value, percent }: any) => (
  <div style={{ marginBottom: 16 }}>
    <h4>{title}</h4>
    <strong>Rp {Number(value).toLocaleString('id-ID')}</strong>
    <p style={{ color: '#6b7280', marginTop: 4 }}>
      Persentase: {percent}%
    </p>
  </div>
);

/* ================= STYLE ================= */
const selectStyle = {
  minWidth: 200,
  height: 40,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid #ddd'
};

const dateStyle = {
  width: 150,
  height: 40,
  padding: '0 10px',
  borderRadius: 8,
  border: '1px solid #ddd'
};

const exportPopup = {
  position: 'absolute' as const,
  right: 0,
  top: '110%',
  background: '#fff',
  borderRadius: 10,
  boxShadow: '0 10px 25px rgba(0,0,0,.12)',
  width: 170,
  padding: 6,
  zIndex: 1000
};

const exportItem = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  textAlign: 'left' as const,
  cursor: 'pointer'
};
