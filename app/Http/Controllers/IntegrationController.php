<?php

namespace App\Http\Controllers;

use App\Models\Integration;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class IntegrationController extends Controller
{
    public function index()
    {
        $integrations = Integration::orderBy('id')->get();

        $kpis = [
            'active'       => $integrations->where('status', 'connected')->count(),
            'inactive'     => $integrations->where('status', 'available')->count(),
            'error'        => $integrations->where('status', 'limited')->count() + $integrations->where('status', 'error')->count(),
            'synced_today' => $integrations->filter(fn ($i) => $i->last_sync_at && $i->last_sync_at->isToday())->count(),
        ];

        return Inertia::render('Integrasi/Index', [
            'integrations' => $integrations,
            'kpis'         => $kpis,
        ]);
    }

    public function show(Integration $integration)
    {
        // Mock recent sync logs
        $logs = [];
        for ($i = 0; $i < 8; $i++) {
            $ok = $i !== 3;
            $logs[] = [
                'timestamp'      => Carbon::now()->subMinutes($i * 30 + 5)->toDateTimeString(),
                'status'         => $ok ? 'success' : 'failed',
                'records_synced' => $ok ? rand(40, 240) : 0,
                'duration_ms'    => rand(180, 2400),
                'error'          => $ok ? null : 'Connection timeout (HTTP 504)',
            ];
        }

        return Inertia::render('Integrasi/Show', [
            'integration' => $integration,
            'logs'        => $logs,
        ]);
    }

    public function sync(Integration $integration)
    {
        $integration->update([
            'last_sync_at' => Carbon::now(),
            'next_sync_at' => Carbon::now()->addMinutes(30),
            'status'       => 'connected',
        ]);

        return back()->with('success', "Sinkronisasi {$integration->name} berhasil dijalankan.");
    }
}
