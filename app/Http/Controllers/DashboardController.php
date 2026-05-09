<?php

namespace App\Http\Controllers;

use App\Models\ComplianceRisk;
use App\Models\Policy;
use App\Models\ReviewTask;
use App\Models\Serkep;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Index', [
            'policies_active'    => Policy::where('status', 'aktif')->count(),
            'serkep_pending'     => Serkep::whereIn('status', ['draft', 'review'])->count(),
            'review_tasks_open'  => ReviewTask::where('status', '!=', 'selesai')->count(),
            'risks_high'         => ComplianceRisk::where('status', 'aktif')->where('impact', 'tinggi')->count(),
        ]);
    }
}
