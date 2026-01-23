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
  // Inisialisasi array kosong
  const [proyek, setProyek] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const [filter, setFilter] = useState({
    id_proyek: '',
    start: '',
    end: ''
  });

  /* ================= FETCH LAPORAN ================= */
  const fetchData = async () => {
    if (!filter.id_proyek) return;

    try {
      const res = await api.get('/laporan-keuangan', { params: filter });
      // PERBAIKAN: Cek wrapper data (jaga-jaga jika backend bungkus response)
      setData(res.data.data || res.data);
    } catch (err) {
      console.error("Gagal load laporan:", err);
      alert("Gagal memuat data laporan keuangan");
    }
  };

  /* ================= FETCH PROYEK (FIX CRASH) ================= */
  useEffect(() => {
    api.get('/proyek')
      .then(res => {
        // SAFETY CHECK: Pastikan ambil array dari dalam wrapper
        const rawData = res.data.data || res.data;
        setProyek(Array.isArray(rawData) ? rawData : []);
      })
      .catch(err => {
        console.error("Gagal load proyek:", err);
        setProyek([]);
      });
  }, []);

  /* ================= CLOSE EXPORT DROPDOWN ================= */
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
    // Safety check biar ga error find of undefined
    if (!Array.isArray(proyek)) return 'Proyek';
    const p = proyek.find(p => String(p.id_proyek) === String(filter.id_proyek));
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
    try {
      const res = await api.get('/laporan-keuangan/export/excel', {
        params: { id_proyek: filter.id_proyek, start: filter.start, end: filter.end },
        responseType: 'blob'
      });
  
      downloadFile(
        res.data,
        `Laporan Keuangan - ${getNamaProyek()}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch (error) {
      alert("Gagal download Excel");
    }
  };

  const exportPdf = async () => {
    try {
      const res = await api.get('/laporan-keuangan/export/pdf', {
        params: { id_proyek: filter.id_proyek, start: filter.start, end: filter.end },
        responseType: 'blob'
      });
  
      downloadFile(
        res.data,
        `Laporan Keuangan - ${getNamaProyek()}.pdf`,
        'application/pdf'
      );
    } catch (error) {
      alert("Gagal download PDF");
    }
  };

  return (
    <main className="main-content">
      {/* ================= HEADER ================= */}
      <div className="flex-between mb-4">
        <div>
          <h1>Laporan Keuangan</h1>
          <p style={{ color: '#6b7280' }}>
            Ringkasan pengeluaran proyek secara realtime
          </p>
        </div>
      </div>

      {/* ================= FILTER CARD ================= */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          padding: '16px',
          marginBottom: '20px'
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
          <option value="">-- Pilih Proyek --</option>
          {/* SAFETY MAP */}
          {Array.isArray(proyek) && proyek.map(p => (
            <option key={p.id_proyek} value={p.id_proyek}>
              {p.nama_proyek}
            </option>
          ))}
        </select>

        <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:'0.9rem'}}>Dari:</span>
            <input
            type="date"
            style={dateStyle}
            value={filter.start}
            onChange={e =>
                setFilter({ ...filter, start: e.target.value })
            }
            />
        </div>

        <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:'0.9rem'}}>Sampai:</span>
            <input
            type="date"
            style={dateStyle}
            value={filter.end}
            onChange={e =>
                setFilter({ ...filter, end: e.target.value })
            }
            />
        </div>

        <button
          className="btn btn-primary"
          onClick={fetchData}
          disabled={!filter.id_proyek}
          style={{ height: 40 }}
        >
          Tampilkan Laporan
        </button>

        {filter.id_proyek && (
          <div ref={exportRef} style={{ position: 'relative', marginLeft: 'auto' }}>
            <button
              className="btn"
              style={{ height: 40, background: 'white', border: '1px solid #ddd' }}
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

      {/* ================= CONTENT REPORT ================= */}
      {data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-3 gap-3 mt-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <Summary title="Total Anggaran" value={data.proyek?.biaya_kesepakatan || 0} color="#2563eb" />
            <Summary title="Total Pengeluaran" value={data.total_pengeluaran} color="#ef4444" />
            <Summary title="Sisa Anggaran" value={data.sisa_anggaran} color="#10b981" />
          </div>

          {/* Chart & Breakdown */}
          <div className="grid grid-4 gap-3 mt-4" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
            
            {/* Grafik */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{marginTop:0, marginBottom:20}}>Tren Pengeluaran</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="tgl_transaksi" 
                        tickFormatter={(str) => {
                            const d = new Date(str);
                            return `${d.getDate()}/${d.getMonth()+1}`;
                        }}
                    />
                    <YAxis tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip 
                        formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Total']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID')}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#395A7F"
                      strokeWidth={3}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown Material vs Tenaga */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{marginTop:0, marginBottom:20}}>Rincian</h3>
              <Breakdown
                title="Material"
                value={data.total_material}
                percent={breakdownPercent(data.total_material)}
                color="#3b82f6"
              />
              <hr style={{margin:'15px 0', borderTop:'1px solid #eee'}} />
              <Breakdown
                title="Tenaga Kerja"
                value={data.total_tenaga}
                percent={breakdownPercent(data.total_tenaga)}
                color="#f59e0b"
              />
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888', background: '#f9fafb', borderRadius: 8 }}>
            <p>Silakan pilih proyek untuk melihat laporan keuangan.</p>
        </div>
      )}
    </main>
  );
}

/* ================= COMPONENT ================= */
const Summary = ({ title, value, color }: any) => (
  <div className="card" style={{ padding: '20px', borderLeft: `4px solid ${color}` }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9rem' }}>{title}</h4>
    <strong style={{ fontSize: '1.5rem', color: '#333' }}>Rp {Number(value).toLocaleString('id-ID')}</strong>
  </div>
);

const Breakdown = ({ title, value, percent, color }: any) => (
  <div style={{ marginBottom: 16 }}>
    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>{title}</h4>
    <strong style={{ fontSize: '1.2rem', display: 'block' }}>Rp {Number(value).toLocaleString('id-ID')}</strong>
    <div style={{ background: '#eee', height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, background: color, height: '100%' }}></div>
    </div>
    <p style={{ color: '#6b7280', marginTop: 4, fontSize: '0.85rem' }}>
      {percent}% dari total
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
  width: 140,
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
  zIndex: 1000,
  border: '1px solid #eee'
};

const exportItem = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  textAlign: 'left' as const,
  cursor: 'pointer',
  background: 'white',
  border: 'none',
  fontSize: '0.9rem',
  color: '#333'
};