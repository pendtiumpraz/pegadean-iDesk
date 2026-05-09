<?php

namespace App\Http\Controllers;

use App\Models\AmlAlert;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AmlAlertController extends Controller
{
    public function index(Request $request)
    {
        $query = AmlAlert::query();

        if ($request->filled('risk_level')) {
            $query->where('risk_level', $request->risk_level);
        }

        if ($request->filled('alert_status')) {
            $query->where('alert_status', $request->alert_status);
        }

        return Inertia::render('AmlAlert/Index', [
            'alerts'  => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('risk_level', 'alert_status'),
        ]);
    }

    public function show(AmlAlert $alert)
    {
        $alert->load(['strReports']);

        return Inertia::render('AmlAlert/Show', [
            'alert' => $alert,
        ]);
    }
}
