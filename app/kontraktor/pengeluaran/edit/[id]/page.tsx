'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';

/* =========================
   CONSTANT SATUAN
========================== */
const SATUAN_OPTIONS = [
  'sak', 'kg', 'ton', 'liter', 'm', 'm2', 'm3',
  'pcs', 'unit', 'lembar', 'batang', 'roll', 'set', 'hari', 'jam',
];

type Distribusi = {
  id_pekerjaan: number | '';
  id_sub: number | '';
  rasio_penggunaan: number;
};

type Detail = {
  nama_item: string;
  satuan: string;
  banyak: number;
  harga_satuan: number;
  distribusi: Distribusi[];
  allow_partial: boolean;
};

type Proyek = {
  id_proyek: number;
  nama_proyek: string;
};

type Pekerjaan = {
  id_pekerjaan: number;
  id_proyek: number;
  nama_pekerjaan: string;
};

type SubPekerjaan = {
  id_sub: number;
  id_pekerjaan: number;
  nama_sub: string;
};

export default function EditPengeluaran() {
  const { id } = useParams(); // useParams bisa otomatis mendeteksi tipe
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Proyek[]>([]);
  const [jobs, setJobs] = useState<Pekerjaan[]>([]);
  const [subs, setSubs] = useState<SubPekerjaan[]>([]);

  const [form, setForm] = useState({
    no_nota: '',
    tgl_transaksi: '',
    spesifikasi: 'Material',
    id_proyek: '',
  });

  const [details, setDetails] = useState<Detail[]>([]);

  /* =========================
     FETCH DATA INITIAL
  ========================== */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // 1. Load Master Data
        const [resProyek, resPekerjaan] = await Promise.all([
            api.get('/proyek'),
            api.get('/pekerjaan')
        ]);
        
        // Handle wrapper data proyek/pekerjaan
        setProjects(Array.isArray(resProyek.data.data) ? resProyek.data.data : resProyek.data);
        setJobs(Array.isArray(resPekerjaan.data.data) ? resPekerjaan.data.data : resPekerjaan.data);

        // 2. Load Data Pengeluaran
        const resPengeluaran = await api.get(`/pengeluaran/${id}`);
        // 🔥 FIX: Handle wrapper data
        const raw = resPengeluaran.data.data || resPengeluaran.data;
        const p = raw.pengeluaran;

        setForm({
          no_nota: p.no_nota ?? '',
          tgl_transaksi: p.tgl_transaksi ?? '',
          spesifikasi: p.spesifikasi ?? 'Material',
          id_proyek: String(p.id_proyek ?? ''),
        });

        // 🔥 FIX: Safety check array details
        const detailsData = Array.isArray(raw.details) ? raw.details : [];
        
        setDetails(
          detailsData.map((d: any): Detail => ({
            nama_item: d.nama_item ?? '',
            satuan: d.satuan ?? '',
            banyak: Number(d.banyak ?? 1),
            harga_satuan: Number(d.harga_satuan ?? 0),
            allow_partial: false,
            distribusi: Array.isArray(d.distribusi) && d.distribusi.length > 0
              ? d.distribusi.map((r: any): Distribusi => ({
                  id_pekerjaan: r.id_pekerjaan ?? '',
                  id_sub: r.id_sub ?? '',
                  rasio_penggunaan: Number(r.rasio_penggunaan ?? 0),
                }))
              : [{ id_pekerjaan: '', id_sub: '', rasio_penggunaan: 100 }],
          }))
        );

        // 3. 🔥 FIX: Auto-load Sub Pekerjaan yang sudah terpilih
        // Kita kumpulkan semua ID Pekerjaan yang ada di detail
        const jobIdsToCheck = new Set<number>();
        detailsData.forEach((d: any) => {
            if (Array.isArray(d.distribusi)) {
                d.distribusi.forEach((r: any) => {
                    if (r.id_pekerjaan) jobIdsToCheck.add(Number(r.id_pekerjaan));
                });
            }
        });

        // Fetch sub-pekerjaan untuk setiap ID yang ditemukan
        jobIdsToCheck.forEach(jobId => {
            api.get(`/pekerjaan/${jobId}/sub-pekerjaan`)
               .then(res => {
                   const newSubs = Array.isArray(res.data.data) ? res.data.data : res.data;
                   setSubs(prev => {
                       // Gabungkan dan hapus duplikat
                       const combined = [...prev, ...newSubs];
                       return Array.from(new Map(combined.map(item => [item.id_sub, item])).values());
                   });
               })
               .catch(err => console.error("Gagal load sub job:", err));
        });

      } catch (err) {
        console.error("Gagal memuat data:", err);
        alert("Gagal memuat data pengeluaran");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        loadInitialData();
    }
  }, [id]);

  const filteredJobs = jobs.filter(
    j => j.id_proyek === Number(form.id_proyek)
  );

  const filteredSubs = (id_pekerjaan: number | '') =>
    subs.filter(s => s.id_pekerjaan === Number(id_pekerjaan));

  /* =========================
     DETAIL HANDLER
  ========================== */
  const updateDetail = <K extends keyof Detail>(
    i: number,
    key: K,
    value: Detail[K]
  ) => {
    setDetails(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [key]: value };
      return copy;
    });
  };

  const addDetail = () => {
    setDetails(prev => [
      ...prev,
      {
        nama_item: '',
        satuan: '',
        banyak: 1,
        harga_satuan: 0,
        allow_partial: false,
        distribusi: [{ id_pekerjaan: '', id_sub: '', rasio_penggunaan: 100 }],
      },
    ]);
  };

  /* =========================
     DISTRIBUSI HANDLER
  ========================== */
  const updateDistribusi = <K extends keyof Distribusi>(
    i: number,
    d: number,
    key: K,
    value: Distribusi[K]
  ) => {
    setDetails(prev => {
      const copy = [...prev];
      // Copy deep array distribusi agar tidak mutasi state langsung
      const newDistribusi = [...copy[i].distribusi];
      const dist = { ...newDistribusi[d], [key]: value };

      if (key === 'id_pekerjaan') {
        dist.id_sub = ''; // Reset sub jika pekerjaan berubah
        
        // Fetch sub pekerjaan baru
        if (value) {
          api.get(`/pekerjaan/${value}/sub-pekerjaan`)
            .then(res => {
                const newSubs = Array.isArray(res.data.data) ? res.data.data : res.data;
                setSubs(prevSubs => {
                    // 🔥 FIX: Append (tambahkan), jangan Replace (timpa)
                    // agar sub pekerjaan di baris lain tidak hilang
                    const combined = [...prevSubs, ...newSubs];
                    return Array.from(new Map(combined.map(item => [item.id_sub, item])).values());
                });
            })
            .catch(err => console.error(err));
        }
      }

      newDistribusi[d] = dist;
      copy[i] = { ...copy[i], distribusi: newDistribusi };
      return copy;
    });
  };

  const addDistribusiIfNeeded = (i: number) => {
    const total = details[i].distribusi.reduce(
      (sum, d) => sum + Number(d.rasio_penggunaan || 0),
      0
    );

    if (total < 100 && !details[i].allow_partial) {
      setDetails(prev => {
        const copy = [...prev];
        const newDist = [...copy[i].distribusi];
        newDist.push({
          id_pekerjaan: '',
          id_sub: '',
          rasio_penggunaan: 100 - total,
        });
        copy[i] = { ...copy[i], distribusi: newDist };
        return copy;
      });
    }
  };

  const removeDetail = (index: number) => {
     if(!confirm("Hapus item ini?")) return;
     setDetails(prev => prev.filter((_, i) => i !== index));
  };

  /* =========================
     UPDATE
  ========================== */
  const handleUpdate = async () => {
    if (loading) return;
    
    // Validasi Sederhana
    for (const d of details) {
      if (!d.nama_item) return alert('Nama item wajib diisi');
      
      const total = d.distribusi.reduce((s, r) => s + Number(r.rasio_penggunaan), 0);
      if (!d.allow_partial && Math.abs(total - 100) > 0.1) {
        return alert(`Total rasio untuk ${d.nama_item} harus 100% (Saat ini: ${total}%)`);
      }

      for (const dist of d.distribusi) {
        if (dist.id_pekerjaan && !dist.id_sub) {
          return alert('Sub pekerjaan wajib dipilih jika pekerjaan dipilih');
        }
      }
    }

    try {
      setLoading(true);
      await api.put(`/pengeluaran/${id}`, {
        ...form,
        id_proyek: Number(form.id_proyek),
        details: details.map(d => ({
          ...d,
          banyak: Number(d.banyak),
          harga_satuan: Number(d.harga_satuan),
          distribusi: d.distribusi.map(r => ({
            ...r,
            id_pekerjaan: Number(r.id_pekerjaan),
            id_sub: Number(r.id_sub),
          })),
        })),
      });

      alert('Pengeluaran berhasil diperbarui');
      router.push('/kontraktor/pengeluaran');
    } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "Gagal update pengeluaran");
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <p className="main-content">Loading data pengeluaran...</p>;

  /* =========================
     RENDER
  ========================== */
  return (
    <main className="main-content">
      <h1>Edit Pengeluaran</h1>

      {/* FORM HEADER */}
      <div className="card" style={{marginBottom: 20}}>
        <div className="grid grid-2 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
            <label style={{display:'block', fontWeight:'bold', marginBottom:5}}>No Nota</label>
            <input
                className="form-control" style={{width:'100%', padding:8}}
                value={form.no_nota}
                onChange={e => setForm({ ...form, no_nota: e.target.value })}
            />
            </div>

            <div>
            <label style={{display:'block', fontWeight:'bold', marginBottom:5}}>Tanggal Transaksi</label>
            <input
                type="date"
                className="form-control" style={{width:'100%', padding:8}}
                value={form.tgl_transaksi}
                onChange={e =>
                setForm({ ...form, tgl_transaksi: e.target.value })
                }
            />
            </div>

            <div>
            <label style={{display:'block', fontWeight:'bold', marginBottom:5}}>Spesifikasi</label>
            <select
                className="form-control" style={{width:'100%', padding:8}}
                value={form.spesifikasi}
                onChange={e =>
                setForm({ ...form, spesifikasi: e.target.value })
                }
            >
                <option>Material</option>
                <option>Tenaga</option>
            </select>
            </div>

            <div>
            <label style={{display:'block', fontWeight:'bold', marginBottom:5}}>Proyek</label>
            <select
                className="form-control" style={{width:'100%', padding:8}}
                value={form.id_proyek}
                onChange={e =>
                setForm({ ...form, id_proyek: e.target.value })
                }
            >
                <option value="">Pilih Proyek</option>
                {projects.map(p => (
                <option key={p.id_proyek} value={p.id_proyek}>
                    {p.nama_proyek}
                </option>
                ))}
            </select>
            </div>
        </div>
      </div>

      {/* DETAIL ITEM */}
      {details.map((d, i) => (
        <div key={i} className="card" style={{ marginBottom: 16, position: 'relative' }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
             <h4 style={{margin:0}}>Material #{i + 1}</h4>
             {details.length > 1 && (
                 <button onClick={() => removeDetail(i)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Hapus</button>
             )}
          </div>

          <div className="grid grid-4 gap-4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 15 }}>
            <input
              className="form-control" style={{padding:8}}
              placeholder="Nama Item"
              value={d.nama_item}
              onChange={e =>
                updateDetail(i, 'nama_item', e.target.value)
              }
            />

            <select
              className="form-control" style={{padding:8}}
              value={d.satuan}
              onChange={e => updateDetail(i, 'satuan', e.target.value)}
            >
              <option value="">Satuan</option>
              {SATUAN_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              className="form-control" style={{padding:8}}
              type="number"
              placeholder="Qty"
              value={d.banyak}
              onChange={e =>
                updateDetail(i, 'banyak', Number(e.target.value))
              }
            />

            <input
              className="form-control" style={{padding:8}}
              type="number"
              placeholder="Harga"
              value={d.harga_satuan}
              onChange={e =>
                updateDetail(i, 'harga_satuan', Number(e.target.value))
              }
            />
          </div>

          <h5 style={{marginBottom:10, color:'#666'}}>Alokasi / Distribusi:</h5>
          {d.distribusi.map((r, idx) => (
            <div key={idx} className="grid grid-3 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 10, marginBottom: 8 }}>
              <select
                className="form-control" style={{padding:8}}
                value={r.id_pekerjaan}
                onChange={e =>
                  updateDistribusi(
                    i,
                    idx,
                    'id_pekerjaan',
                    Number(e.target.value)
                  )
                }
              >
                <option value="">Pilih Pekerjaan</option>
                {filteredJobs.map(j => (
                  <option key={j.id_pekerjaan} value={j.id_pekerjaan}>
                    {j.nama_pekerjaan}
                  </option>
                ))}
              </select>

              <select
                className="form-control" style={{padding:8}}
                value={r.id_sub}
                onChange={e =>
                  updateDistribusi(
                    i,
                    idx,
                    'id_sub',
                    Number(e.target.value)
                  )
                }
                disabled={!r.id_pekerjaan}
              >
                <option value="">Sub Pekerjaan</option>
                {filteredSubs(Number(r.id_pekerjaan)).map(s => (
                  <option key={s.id_sub} value={s.id_sub}>
                    {s.nama_sub}
                  </option>
                ))}
              </select>

              <div style={{position:'relative'}}>
                  <input
                    className="form-control" style={{padding:8, width:'100%'}}
                    type="number"
                    value={r.rasio_penggunaan}
                    onChange={e =>
                      updateDistribusi(
                        i,
                        idx,
                        'rasio_penggunaan',
                        Number(e.target.value)
                      )
                    }
                    onBlur={() => addDistribusiIfNeeded(i)}
                  />
                  <span style={{position:'absolute', right:5, top:8, fontSize:'0.8rem', color:'#888'}}>%</span>
              </div>
            </div>
          ))}

          <label style={{fontSize:'0.9rem', color:'#666', marginTop:5, display:'block'}}>
            <input
              type="checkbox"
              checked={d.allow_partial}
              onChange={e =>
                updateDetail(i, 'allow_partial', e.target.checked)
              }
            />{' '}
            Izinkan total distribusi kurang dari 100% (Simpan Sementara)
          </label>
        </div>
      ))}

      <button className="btn-outline" onClick={addDetail} style={{width:'100%', padding:10, marginBottom:20, border:'2px dashed #ccc', color:'#666'}}>
          + Tambah Material Lain
      </button>

      <div style={{ marginTop: 24, display:'flex', gap:10, justifyContent:'flex-end' }}>
        <button className="btn-secondary" onClick={() => router.back()} style={{padding:'10px 20px', background:'#eee', border:'none', borderRadius:5}}>Batal</button>
        <button className="btn-primary" onClick={handleUpdate} disabled={loading} style={{padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:5}}>
          {loading ? 'Menyimpan...' : 'Update Pengeluaran'}
        </button>
      </div>
    </main>
  );
}