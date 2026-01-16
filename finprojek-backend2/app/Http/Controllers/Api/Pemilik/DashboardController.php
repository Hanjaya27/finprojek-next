<?php

namespace App\Http\Controllers\Api\Pemilik;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $totalProyek = DB::table('proyek')
            ->where('id_pemilik', $user->id_user)
            ->count();

        $proyekBerjalan = DB::table('proyek')
            ->where('id_pemilik', $user->id_user)
            ->where('status', 'Berjalan')
            ->count();

        $proyekSelesai = DB::table('proyek')
            ->where('id_pemilik', $user->id_user)
            ->where('status', 'Selesai')
            ->count();

        return response()->json([
            'nama' => $user->nama_lengkap,
            'total_proyek' => $totalProyek,
            'proyek_berjalan' => $proyekBerjalan,
            'proyek_selesai' => $proyekSelesai,
        ]);
    }
}
