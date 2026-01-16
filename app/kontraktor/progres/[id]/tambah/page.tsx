'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function TambahProgresPage() {
  const { id } = useParams();
  const router = useRouter();

  const [persentaseTerakhir, setPersentaseTerakhir] = useState(0);
  const [tambahPersen, setTambahPersen] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= AMBIL PERSENTASE TERAKHIR ================= */
  useEffect(() => {
    const fetchLast = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/progres/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPersentaseTerakhir(data.persentase_terakhir);
    };

    fetchLast();
  }, [id]);

  /* ================= HANDLE FILE ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // validasi ukuran per file
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File "${file.name}" terlalu besar. Maksimal 20MB per file.`
        );
        return;
      }
    }

    setFiles(selectedFiles);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    setLoading(true);

    const fd = new FormData();
    fd.append('judul_update', judul);
    fd.append('deskripsi', deskripsi);
    fd.append('tambah_persentase', tambahPersen);

    files.forEach(file => {
      fd.append('dokumen[]', file); // ⬅️ PENTING
    });

    const res = await fetch(`http://localhost:8000/api/progres/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    setLoading(false);

    if (!res.ok) {
      alert('Gagal menambahkan progres');
      return;
    }

    alert('Progres berhasil ditambahkan');
    router.push(`/kontraktor/progres/${id}`);
  };

  return (
    <main className="main-content">
      <h1 className="title">Upload Progres</h1>

      <section className="card">
        <form onSubmit={handleSubmit} className="form">
          <label>Persentase Saat Ini</label>
          <input value={persentaseTerakhir} disabled />

          <label>Tambah Persentase (%)</label>
          <input
            type="number"
            value={tambahPersen}
            onChange={e => setTambahPersen(e.target.value)}
            required
          />

          <label>Judul Update</label>
          <input
            value={judul}
            onChange={e => setJudul(e.target.value)}
            placeholder="Contoh: Pekerjaan Struktur"
          />

          <label>Deskripsi</label>
          <textarea
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
          />

          <label>Upload Foto (max 5MB)</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />

          {/* ===== PREVIEW FILE ===== */}
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file, i) => (
                <li key={i}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          )}

          <button className="btn-primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Progres'}
          </button>
        </form>
      </section>
    </main>
  );
}
