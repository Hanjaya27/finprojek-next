<?php

namespace App\Http\Controllers\Api\Kontraktor;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Proyek;
use Illuminate\Support\Facades\Storage;

class ProyekController extends Controller
{
    /* =========================
       AUTH
    ========================== */
    private function authUser(Request $request)
    {
        return DB::table('user')
            ->where('api_token', $request->bearerToken())
            ->first();
    }

    /* =========================
       CEK TRIAL
       return true = trial habis
    ========================== */
    private function isTrialExpired($user)
    {
        // Premium selalu boleh
        if ($user->is_premium == 1) {
            return false;
        }

        // Tidak ada tanggal expired → dianggap habis
        if (!$user->vip_expired_at) {
            return true;
        }

        return now()->greaterThan($user->vip_expired_at);
    }

    /* =========================
       INDEX (READ)
    ========================== */
    public function index(Request $request)
    {
        $user = $this->authUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $proyek = Proyek::where('id_kontraktor', $user->id_user)->get();

        $proyek->each(function ($p) {
            $p->dokumen_mou_url = $p->dokumen_mou
                ? asset('storage/' . $p->dokumen_mou)
                : null;
        });

        return response()->json($proyek);
    }

    /* =========================
       STORE (CREATE)
    ========================== */
    public function store(Request $request)
    {
        $user = $this->authUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        if ($this->isTrialExpired($user)) {
            return response()->json([
                'message' => 'Masa trial Anda sudah habis. Silakan upgrade.'
            ], 403);
        }
    
        $validated = $request->validate([
            'nama_proyek' => 'required|string|max:100',
            'lokasi' => 'nullable|string|max:150',
            'biaya_kesepakatan' => 'nullable|numeric',
            'tgl_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date',
            'id_pemilik' => 'nullable|integer',
            'dokumen_mou' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);
    
        // Upload file jika ada
        if ($request->hasFile('dokumen_mou')) {
            $validated['dokumen_mou'] = $request->file('dokumen_mou')
                ->store('dokumen_mou', 'public');
        } else {
            $validated['dokumen_mou'] = null;
        }
    
        // Field otomatis dari sistem
        $validated['id_kontraktor'] = $user->id_user;
        $validated['status'] = 'aktif';
        $validated['kode_proyek'] = strtoupper(
            substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6)
        );
    
        Proyek::create($validated);
    
        return response()->json([
            'message' => 'Proyek berhasil ditambahkan'
        ], 201);
    }
    
    /* =========================
       SHOW (READ)
    ========================== */
    public function show(Request $request, $id)
    {
        $user = $this->authUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $proyek = Proyek::where('id_proyek', $id)
            ->where('id_kontraktor', $user->id_user)
            ->first();

        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }

        $proyek->dokumen_mou_url =
            $proyek->dokumen_mou &&
            Storage::disk('public')->exists($proyek->dokumen_mou)
                ? asset('storage/' . $proyek->dokumen_mou)
                : null;

        return response()->json($proyek);
    }

    /* =========================
       UPDATE
    ========================== */
    public function update(Request $request, $id)
    {
        $user = $this->authUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($this->isTrialExpired($user)) {
            return response()->json([
                'message' => 'Masa trial Anda sudah habis. Silakan upgrade.'
            ], 403);
        }

        $proyek = Proyek::where('id_proyek', $id)
            ->where('id_kontraktor', $user->id_user)
            ->first();

        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'nama_proyek' => 'required|string',
            'lokasi' => 'required|string',
            'biaya_kesepakatan' => 'required|numeric',
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'required|date',
            'status' => 'required|string',
            'dokumen_mou' => 'nullable|file|mimes:pdf,doc,docx|max:2048',
        ]);

        if ($request->hasFile('dokumen_mou')) {
            if ($proyek->dokumen_mou) {
                Storage::disk('public')->delete($proyek->dokumen_mou);
            }

            $validated['dokumen_mou'] =
                $request->file('dokumen_mou')->store('dokumen_mou', 'public');
        }

        $proyek->update($validated);

        return response()->json([
            'message' => 'Proyek berhasil diperbarui'
        ]);
    }

    /* =========================
       DESTROY
    ========================== */
    public function destroy(Request $request, $id)
    {
        $user = $this->authUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($this->isTrialExpired($user)) {
            return response()->json([
                'message' => 'Masa trial Anda sudah habis. Silakan upgrade.'
            ], 403);
        }

        $proyek = Proyek::where('id_proyek', $id)
            ->where('id_kontraktor', $user->id_user)
            ->first();

        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }

        $jumlahPekerjaan = DB::table('pekerjaan')
            ->where('id_proyek', $id)
            ->count();

        if ($jumlahPekerjaan > 0) {
            return response()->json([
                'message' => 'Proyek tidak bisa dihapus karena masih memiliki pekerjaan'
            ], 422);
        }

        if ($proyek->dokumen_mou) {
            Storage::disk('public')->delete($proyek->dokumen_mou);
        }

        $proyek->delete();

        return response()->json([
            'message' => 'Proyek berhasil dihapus'
        ]);
    }
}
