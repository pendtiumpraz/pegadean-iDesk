<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::all();

        $auditTrails = AuditLog::orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($a) {
                return [
                    'id'           => $a->id,
                    'actor_type'   => $a->actor_type,
                    'actor_name'   => $a->actor_name,
                    'action'       => $a->action,
                    'entity_type'  => $a->entity_type,
                    'entity_id'    => $a->entity_id,
                    'entity_name'  => $a->entity_name ?? $a->entity_id,
                    'description'  => $a->description,
                    'ip_address'   => $a->ip_address,
                    'created_at'   => $a->created_at,
                ];
            });

        return Inertia::render('Pengaturan/Index', [
            'settings'     => $settings,
            'audit_trails' => $auditTrails,
        ]);
    }

    public function update(Request $request, string $key)
    {
        $request->validate([
            'value' => 'present',
        ]);

        $setting = SystemSetting::where('key', $key)->firstOrFail();
        $setting->update(['value' => $request->value]);

        return redirect()->route('settings.index')->with('success', 'Pengaturan berhasil disimpan.');
    }
}
