<?php

namespace App\Http\Controllers\Api\Kontraktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProgresController extends Controller
{
    /**
     * LIST PROYEK + PROGRES TERAKHIR
     */
    public function index(Request $request)
    {
        $idKontraktor = $request->user()->id_user;

        $data = DB::table('proyek as p')
            ->leftJoin('progress_proyek as pr', function ($join) {
                $join->on('p.id_proyek', '=', 'pr.id_proyek')
                     ->whereRaw('pr.id_progress = (
                        SELECT MAX(id_progress)
                        FROM progress_proyek
                        WHERE id_proyek = p.id_proyek
                     )');
            })
            ->where('p.id_kontraktor', $idKontraktor)
            ->select(
                'p.id_proyek',
                'p.nama_proyek',
                'p.id_pemilik',
                DB::raw('COALESCE(pr.persentase, 0) as progres')
            )
            ->get();

        return response()->json($data);
    }

    /**
     * DETAIL PROGRES PROYEK
     */
    public function show($id_proyek)
    {
        $proyek = DB::table('proyek')
            ->where('id_proyek', $id_proyek)
            ->select('id_proyek', 'nama_proyek')
            ->first();
    
        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }
    
        $progressList = DB::table('progress_proyek')
            ->where('id_proyek', $id_proyek)
            ->orderBy('tgl_update', 'asc')
            ->orderBy('id_progress', 'asc')
            ->get();
    
        $persentaseTerakhir = $progressList->last()->persentase ?? 0;
    
        return response()->json([
            'proyek' => $proyek,
            'persentase_terakhir' => $persentaseTerakhir,
            'progress_list' => $progressList
        ]);
    }
    
    public function store(Request $request, $id_proyek)
    {
        $request->validate([
            'judul_update' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'tambah_persentase' => 'required|numeric|min:0|max:100',
            'dokumen' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480',
        ]);
    
        // ambil persentase terakhir
        $last = DB::table('progress_proyek')
            ->where('id_proyek', $id_proyek)
            ->orderByDesc('id_progress')
            ->first();
    
        $persentaseLama = $last->persentase ?? 0;
        $persentaseBaru = $persentaseLama + $request->tambah_persentase;
    
        if ($persentaseBaru > 100) {
            return response()->json([
                'message' => 'Persentase tidak boleh melebihi 100%'
            ], 422);
        }
    
        $path = null;
        if ($request->hasFile('dokumen')) {
            $path = $request->file('dokumen')
                ->store('progress-proyek', 'public');
        }
    
        DB::table('progress_proyek')->insert([
            'id_proyek' => $id_proyek,
            'judul_update' => $request->judul_update,
            'deskripsi' => $request->deskripsi,
            'persentase' => $persentaseBaru,
            'foto_progress' => $path,
            'tgl_update' => now()->toDateString(),
        ]);
    
        return response()->json([
            'message' => 'Progres berhasil ditambahkan',
            'persentase_sekarang' => $persentaseBaru
        ]);
    }
    
}
