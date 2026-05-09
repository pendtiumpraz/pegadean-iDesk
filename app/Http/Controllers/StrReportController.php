<?php

namespace App\Http\Controllers;

use App\Models\AmlAlert;
use App\Models\StrReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StrReportController extends Controller
{
    public function index(Request $request)
    {
        $query = StrReport::with(['amlAlert', 'submittedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('StrReport/Index', [
            'reports' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        $alerts = AmlAlert::select('id', 'transaction_id', 'nasabah_masked', 'nominal')
            ->where('is_str_submitted', false)
            ->get();

        return Inertia::render('StrReport/Create', [
            'alerts' => $alerts,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'aml_alert_id' => 'required|exists:aml_alerts,id',
            'status'       => 'required|string|max:50',
        ]);

        StrReport::create($data);

        return redirect()->route('str.index')->with('success', 'Laporan STR berhasil dibuat.');
    }

    public function show(StrReport $str)
    {
        $str->load(['amlAlert', 'submittedBy']);

        return Inertia::render('StrReport/Show', [
            'str' => $str,
        ]);
    }

    public function update(Request $request, StrReport $str)
    {
        $data = $request->validate([
            'status' => 'required|string|max:50',
        ]);

        $str->update($data);

        return redirect()->route('str.show', $str)->with('success', 'Laporan STR berhasil diperbarui.');
    }

    public function submit(StrReport $str)
    {
        $str->update([
            'status'       => 'submitted',
            'submitted_by' => auth()->id(),
            'submitted_at' => now(),
        ]);

        return redirect()->route('str.show', $str)->with('success', 'Laporan STR berhasil disubmit.');
    }
}
