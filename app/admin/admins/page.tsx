'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

type Props = {
  onClose?: () => void; // optional: modal / page
};

export default function TambahAdmin({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose(); // modal
    } else {
      router.push('/admin/admins'); // page
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    // Ambil data dari form
    const formData = new FormData(e.currentTarget);
    
    // Ubah ke JSON Object agar lebih rapi & konsisten
    const payload = {
        nama_lengkap: formData.get('nama_lengkap'),
        email: formData.get('email'),
        password: formData.get('password'),
        status: formData.get('status'),
        role: 'admin', // 🔥 PAKSA ROLE ADMIN
        is_premium: 0  // Admin tidak butuh premium
    };

    try {
      // ✅ FIX: Hapus '/api' di depan, dan gunakan endpoint '/admin/users'
      await api.post('/admin/users', payload);
      
      alert('Admin berhasil ditambahkan');
      handleClose(); 
      
      // Refresh halaman jika bukan modal
      if (!onClose) router.refresh();
      
    } catch (err: any) {
      console.error(err);
      // Handle validasi error Laravel
      const msg = err.response?.data?.message || 'Gagal menambahkan admin';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal active" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999}}>
      <div className="modal-content" style={{background:'white', padding:30, borderRadius:8, width:400}}>
        <div className="modal-header" style={{display:'flex', justifyContent:'space-between', marginBottom:20}}>
          <h2 style={{margin:0}}>Tambah Admin</h2>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            style={{background:'transparent', border:'none', fontSize:24, cursor:'pointer'}}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:15}}>
            <label style={{fontWeight:'bold'}}>Nama Lengkap</label>
            <input
              className="form-control" style={{width:'100%', padding:10, marginTop:5, border:'1px solid #ccc', borderRadius:4}}
              name="nama_lengkap"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group" style={{marginBottom:15}}>
            <label style={{fontWeight:'bold'}}>Email</label>
            <input
                className="form-control" style={{width:'100%', padding:10, marginTop:5, border:'1px solid #ccc', borderRadius:4}}
                type="email"
                name="email"
                autoComplete="new-email"
                required
              />
          </div>

          <div className="form-group" style={{marginBottom:15}}>
            <label style={{fontWeight:'bold'}}>Password</label>
            <input
                className="form-control" style={{width:'100%', padding:10, marginTop:5, border:'1px solid #ccc', borderRadius:4}}
                type="password"
                name="password"
                autoComplete="new-password"
                required
              />
          </div>

          <div className="form-group" style={{marginBottom:20}}>
            <label style={{fontWeight:'bold'}}>Status</label>
            <select name="status" className="form-control" style={{width:'100%', padding:10, marginTop:5, border:'1px solid #ccc', borderRadius:4}} required>
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="modal-footer" style={{display:'flex', justifyContent:'flex-end', gap:10}}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              style={{padding:'10px 20px', background:'#eee', border:'none', borderRadius:4, cursor:'pointer'}}
            >
              Batal
            </button>

            <button
              className="btn btn-primary"
              disabled={loading}
              style={{padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:4, cursor:'pointer'}}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}