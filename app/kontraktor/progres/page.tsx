'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Proyek = {
  id_proyek: number;
  nama_proyek: string;
  progres: number | string | null;
};

export default function ProgresPage() {
  const router = useRouter();
  const [data, setData] = useState<Proyek[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetch('http://localhost:8000/api/progres', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="main-content">
      <h1 className="title">Progres Proyek</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Nama Proyek</th>
            <th>Progres</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => {
            // ✅ FIX UTAMA DI SINI
            const progres = Math.min(
              100,
              Math.max(0, Number(item.progres) || 0)
            );

            return (
              <tr key={item.id_proyek}>
                <td>{item.nama_proyek}</td>

                <td>
                  <strong>{progres}%</strong>
                  <div className="progress-bar small">
                    <div
                      className="progress-fill"
                      style={{ width: `${progres}%` }}
                    />
                  </div>
                </td>

                <td>
                  <button
                    className="btn-outline"
                    onClick={() =>
                      router.push(`/kontraktor/progres/${item.id_proyek}`)
                    }
                  >
                    Detail
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
