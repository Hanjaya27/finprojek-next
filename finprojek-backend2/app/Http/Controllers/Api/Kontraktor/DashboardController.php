<?php

namespace App\Http\Controllers\Api\Kontraktor;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        /* =======================
           STATUS PROYEK
        ======================= */
        $statusProyek = [
            'berjalan' => DB::table('proyek')
                ->where('id_kontraktor', $user->id_user)
                ->where('status', 'Berjalan')
                ->count(),

            'selesai' => DB::table('proyek')
                ->where('id_kontraktor', $user->id_user)
                ->where('status', 'Selesai')
                ->count(),
        ];

        /* =======================
           PEKERJAAN PER PROYEK
        ======================= */
        $pekerjaanPerProyek = DB::table('proyek')
            ->leftJoin('pekerjaan', 'proyek.id_proyek', '=', 'pekerjaan.id_proyek')
            ->where('proyek.id_kontraktor', $user->id_user)
            ->groupBy('proyek.id_proyek', 'proyek.nama_proyek')
            ->select(
                'proyek.nama_proyek',
                DB::raw('COUNT(pekerjaan.id_pekerjaan) as total_pekerjaan')
            )
            ->get();

        return response()->json([
            'nama' => $user->nama_lengkap,

            'total_proyek' => DB::table('proyek')
                ->where('id_kontraktor', $user->id_user)
                ->count(),

            'total_pekerjaan' => DB::table('pekerjaan')
                ->join('proyek', 'pekerjaan.id_proyek', '=', 'proyek.id_proyek')
                ->where('proyek.id_kontraktor', $user->id_user)
                ->count(),

            /* === DATA BARU UNTUK DASHBOARD === */
            'status_proyek' => $statusProyek,
            'pekerjaan_per_proyek' => $pekerjaanPerProyek,
        ]);
    }
}
