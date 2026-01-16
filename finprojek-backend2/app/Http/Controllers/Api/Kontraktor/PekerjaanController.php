<?php

namespace App\Http\Controllers\Api\Kontraktor;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PekerjaanController extends Controller
{
    public function index(Request $request)
    {
        $user = auth('api')->user();

        return DB::table('pekerjaan')
            ->join('proyek', 'pekerjaan.id_proyek', '=', 'proyek.id_proyek')
            ->where('proyek.id_kontraktor', $user->id_user)
            ->select(
                'pekerjaan.id_pekerjaan',
                'pekerjaan.nama_pekerjaan',
                'pekerjaan.id_proyek', // 🔥 PENTING UNTUK FILTER
                'proyek.nama_proyek',

                DB::raw('
                    (SELECT COUNT(*)
                     FROM sub_pekerjaan
                     WHERE sub_pekerjaan.id_pekerjaan = pekerjaan.id_pekerjaan
                    ) as sub_pekerjaan
                '),

                DB::raw('
                    COALESCE(
                        (SELECT AVG(persentase)
                         FROM progress_proyek
                         WHERE progress_proyek.id_proyek = proyek.id_proyek
                        ), 0
                    ) as progress
                ')
            )
            ->get();
    }
   

    public function store(Request $request)
    {
        $request->validate([
            'id_proyek' => 'required|integer',
            'nama_pekerjaan' => [
                'required',
                'string',
                'max:100',
                Rule::unique('pekerjaan')->where(function ($query) use ($request) {
                    return $query->where('id_proyek', $request->id_proyek);
                }),
            ],
            'keterangan' => 'nullable|string',
        ], [
            'id_proyek.required' => 'Lengkapi data Pekerjaan',
            'nama_pekerjaan.required' => 'Lengkapi data Pekerjaan',
            'nama_pekerjaan.unique' => 'Nama pekerjaan sudah ada pada proyek ini',
        ]);
    
        DB::table('pekerjaan')->insert([
            'id_proyek' => $request->id_proyek,
            'nama_pekerjaan' => $request->nama_pekerjaan,
            'keterangan' => $request->keterangan,
        ]);
    
        return response()->json([
            'message' => 'Pekerjaan berhasil ditambahkan'
        ], 201);
    }
    
    public function destroy($id)
{
    $user = auth('api')->user();

    $pekerjaan = DB::table('pekerjaan')
        ->join('proyek', 'pekerjaan.id_proyek', '=', 'proyek.id_proyek')
        ->where('pekerjaan.id_pekerjaan', $id)
        ->where('proyek.id_kontraktor', $user->id_user)
        ->select('pekerjaan.id_pekerjaan')
        ->first();

    if (!$pekerjaan) {
        return response()->json(['message' => 'Pekerjaan tidak ditemukan'], 404);
    }

    DB::table('pekerjaan')
        ->where('id_pekerjaan', $id)
        ->delete();

    return response()->json(['message' => 'Pekerjaan berhasil dihapus']);
}
public function indexByProyek($id_proyek)
{
    $jobs = DB::table('pekerjaan')
              ->where('id_proyek', $id_proyek)
              ->get();
    return response()->json($jobs);
}
public function show($id)
{
    $user = auth('api')->user();

    // =========================
    // PEKERJAAN (HEADER)
    // =========================
    $job = DB::table('pekerjaan')
        ->join('proyek', 'pekerjaan.id_proyek', '=', 'proyek.id_proyek')
        ->where('pekerjaan.id_pekerjaan', $id)
        ->where('proyek.id_kontraktor', $user->id_user)
        ->select(
            'pekerjaan.id_pekerjaan',
            'pekerjaan.id_proyek',
            'pekerjaan.nama_pekerjaan',
            'pekerjaan.keterangan'
        )
        ->first();

    if (!$job) {
        return response()->json([
            'message' => 'Pekerjaan tidak ditemukan'
        ], 404);
    }

    // =========================
    // SUB PEKERJAAN
    // =========================
    $subPekerjaan = DB::table('sub_pekerjaan')
        ->where('id_pekerjaan', $id)
        ->orderBy('id_sub')
        ->get();

    // =========================
    // RESPONSE FINAL
    // =========================
    return response()->json([
        'pekerjaan' => $job,
        'sub_pekerjaan' => $subPekerjaan,
    ]);
}


public function update(Request $request, $id)
{
    $user = auth('api')->user();

    $request->validate([
        'id_proyek' => 'required|integer',
        'nama_pekerjaan' => 'required|string|max:100',
        'keterangan' => 'nullable|string',
    ]);

    $pekerjaan = DB::table('pekerjaan')
        ->join('proyek', 'pekerjaan.id_proyek', '=', 'proyek.id_proyek')
        ->where('pekerjaan.id_pekerjaan', $id)
        ->where('proyek.id_kontraktor', $user->id_user)
        ->select('pekerjaan.id_pekerjaan')
        ->first();

    if (!$pekerjaan) {
        return response()->json(['message' => 'Pekerjaan tidak ditemukan'], 404);
    }

    DB::table('pekerjaan')
        ->where('id_pekerjaan', $id)
        ->update([
            'id_proyek' => $request->id_proyek,
            'nama_pekerjaan' => $request->nama_pekerjaan,
            'keterangan' => $request->keterangan,
        ]);

    return response()->json(['message' => 'Pekerjaan berhasil diupdate']);
}


}
