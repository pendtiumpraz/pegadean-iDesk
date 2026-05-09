<?php

namespace App\Http\Controllers;

use App\Models\ComplianceRisk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplianceRiskController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplianceRisk::with(['picUser', 'serkep']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('impact')) {
            $query->where('impact', $request->impact);
        }

        return Inertia::render('ComplianceRisk/Index', [
            'risks'   => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('status', 'category', 'impact'),
        ]);
    }

    public function create()
    {
        return Inertia::render('ComplianceRisk/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'risk_code'      => 'required|string|max:50|unique:compliance_risks,risk_code',
            'category'       => 'required|string|max:100',
            'description'    => 'required|string',
            'owner_div'      => 'nullable|string|max:100',
            'likelihood'     => 'required|string|max:50',
            'impact'         => 'required|string|max:50',
            'inherent_score' => 'nullable|integer',
            'residual_score' => 'nullable|integer',
            'control_count'  => 'nullable|integer',
            'control_desc'   => 'nullable|string',
            'pic_user_id'    => 'nullable|exists:users,id',
            'target_date'    => 'nullable|date',
            'status'         => 'required|string|max:50',
            'source'         => 'nullable|string|max:100',
            'serkep_id'      => 'nullable|exists:serkeps,id',
        ]);

        ComplianceRisk::create($data);

        return redirect()->route('risks.index')->with('success', 'Risiko kepatuhan berhasil ditambahkan.');
    }

    public function show(ComplianceRisk $risk)
    {
        $risk->load(['picUser', 'serkep']);

        return Inertia::render('ComplianceRisk/Show', [
            'risk' => $risk,
        ]);
    }

    public function edit(ComplianceRisk $risk)
    {
        return Inertia::render('ComplianceRisk/Edit', [
            'risk' => $risk,
        ]);
    }

    public function update(Request $request, ComplianceRisk $risk)
    {
        $data = $request->validate([
            'risk_code'      => 'required|string|max:50|unique:compliance_risks,risk_code,' . $risk->id,
            'category'       => 'required|string|max:100',
            'description'    => 'required|string',
            'owner_div'      => 'nullable|string|max:100',
            'likelihood'     => 'required|string|max:50',
            'impact'         => 'required|string|max:50',
            'inherent_score' => 'nullable|integer',
            'residual_score' => 'nullable|integer',
            'control_count'  => 'nullable|integer',
            'control_desc'   => 'nullable|string',
            'pic_user_id'    => 'nullable|exists:users,id',
            'target_date'    => 'nullable|date',
            'status'         => 'required|string|max:50',
            'source'         => 'nullable|string|max:100',
            'serkep_id'      => 'nullable|exists:serkeps,id',
        ]);

        $risk->update($data);

        return redirect()->route('risks.show', $risk)->with('success', 'Risiko kepatuhan berhasil diperbarui.');
    }

    public function destroy(ComplianceRisk $risk)
    {
        $risk->delete();

        return redirect()->route('risks.index')->with('success', 'Risiko kepatuhan berhasil dihapus.');
    }

    public function trash(Request $request)
    {
        $risks = ComplianceRisk::onlyTrashed()->latest()->paginate(20)->withQueryString();

        return Inertia::render('ComplianceRisk/Trash', [
            'risks' => $risks,
        ]);
    }

    public function restore($id)
    {
        $risk = ComplianceRisk::onlyTrashed()->findOrFail($id);
        $risk->restore();

        return redirect()->route('risks.trash')->with('success', 'Risiko kepatuhan berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $risk = ComplianceRisk::onlyTrashed()->findOrFail($id);
        $risk->forceDelete();

        return redirect()->route('risks.trash')->with('success', 'Risiko kepatuhan berhasil dihapus permanen.');
    }
}
