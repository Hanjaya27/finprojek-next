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
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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
     FETCH DATA
  ========================== */
  useEffect(() => {
    api.get('/proyek').then(res => setProjects(res.data));
    api.get('/pekerjaan').then(res => setJobs(res.data));

    api.get(`/pengeluaran/${id}`).then(res => {
      const p = res.data.pengeluaran;

      setForm({
        no_nota: p.no_nota ?? '',
        tgl_transaksi: p.tgl_transaksi ?? '',
        spesifikasi: p.spesifikasi ?? 'Material',
        id_proyek: String(p.id_proyek ?? ''),
      });

      setDetails(
        res.data.details.map((d: any): Detail => ({
          nama_item: d.nama_item ?? '',
          satuan: d.satuan ?? '',
          banyak: Number(d.banyak ?? 1),
          harga_satuan: Number(d.harga_satuan ?? 0),
          allow_partial: false,
          distribusi: d.distribusi?.length
            ? d.distribusi.map(
                (r: any): Distribusi => ({
                  id_pekerjaan: r.id_pekerjaan ?? '',
                  id_sub: r.id_sub ?? '',
                  rasio_penggunaan: Number(r.rasio_penggunaan ?? 0),
                })
              )
            : [{ id_pekerjaan: '', id_sub: '', rasio_penggunaan: 100 }],
        }))
      );
    });
  }, [id]);

  const filteredJobs = jobs.filter(
    j => j.id_proyek === Number(form.id_proyek)
  );

  const filteredSubs = (id_pekerjaan: number | '') =>
    subs.filter(s => s.id_pekerjaan === id_pekerjaan);

  /* =========================
     DETAIL HANDLER (FIX TYPE)
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
      const dist = { ...copy[i].distribusi[d], [key]: value };

      if (key === 'id_pekerjaan') {
        dist.id_sub = '';
        if (value) {
          api
            .get(`/pekerjaan/${value}/sub-pekerjaan`)
            .then(res => setSubs(res.data));
        }
      }

      copy[i].distribusi[d] = dist;
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
        copy[i].distribusi.push({
          id_pekerjaan: '',
          id_sub: '',
          rasio_penggunaan: 100 - total,
        });
        return copy;
      });
    }
  };

  /* =========================
     UPDATE
  ========================== */
  const handleUpdate = async () => {
    for (const d of details) {
      const total = d.distribusi.reduce(
        (s, r) => s + Number(r.rasio_penggunaan),
        0
      );

      if (!d.allow_partial && total !== 100) {
        alert('Total rasio harus 100%');
        return;
      }

      if (!d.nama_item) {
        alert('Nama item wajib diisi');
        return;
      }

      for (const dist of d.distribusi) {
        if (!dist.id_sub) {
          alert('Sub pekerjaan wajib dipilih');
          return;
        }
      }
    }

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
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <main className="main-content">
      <h1>Edit Pengeluaran</h1>

      {/* FORM HEADER */}
      <div className="grid-2 gap-4">
        <div>
          <label>No Nota</label>
          <input
            value={form.no_nota}
            onChange={e => setForm({ ...form, no_nota: e.target.value })}
          />
        </div>

        <div>
          <label>Tanggal Transaksi</label>
          <input
            type="date"
            value={form.tgl_transaksi}
            onChange={e =>
              setForm({ ...form, tgl_transaksi: e.target.value })
            }
          />
        </div>

        <div>
          <label>Spesifikasi</label>
          <select
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
          <label>Proyek</label>
          <select
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

      {/* DETAIL ITEM */}
      {details.map((d, i) => (
        <div key={i} className="card" style={{ marginTop: 16 }}>
          <h4>Material #{i + 1}</h4>

          <div className="grid-4 gap-4">
            <input
              placeholder="Nama Item"
              value={d.nama_item}
              onChange={e =>
                updateDetail(i, 'nama_item', e.target.value)
              }
            />

            <select
              value={d.satuan}
              onChange={e => updateDetail(i, 'satuan', e.target.value)}
            >
              <option value="">Pilih Satuan</option>
              {SATUAN_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={d.banyak}
              onChange={e =>
                updateDetail(i, 'banyak', Number(e.target.value))
              }
            />

            <input
              type="number"
              value={d.harga_satuan}
              onChange={e =>
                updateDetail(i, 'harga_satuan', Number(e.target.value))
              }
            />
          </div>

          <h5>Distribusi Material</h5>
          {d.distribusi.map((r, idx) => (
            <div key={idx} className="grid-3 gap-4">
              <select
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
                value={r.id_sub}
                onChange={e =>
                  updateDistribusi(
                    i,
                    idx,
                    'id_sub',
                    Number(e.target.value)
                  )
                }
              >
                <option value="">Pilih Sub Pekerjaan</option>
                {filteredSubs(r.id_pekerjaan).map(s => (
                  <option key={s.id_sub} value={s.id_sub}>
                    {s.nama_sub}
                  </option>
                ))}
              </select>

              <input
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
            </div>
          ))}

          <label>
            <input
              type="checkbox"
              checked={d.allow_partial}
              onChange={e =>
                updateDetail(i, 'allow_partial', e.target.checked)
              }
            />{' '}
            Simpan sementara (tidak 100%)
          </label>
        </div>
      ))}

      <button onClick={addDetail}>+ Tambah Material</button>

      <div style={{ marginTop: 24 }}>
        <button onClick={() => router.back()}>Batal</button>
        <button className="btn btn-primary" onClick={handleUpdate}>
          Update Pengeluaran
        </button>
      </div>
    </main>
  );
}
