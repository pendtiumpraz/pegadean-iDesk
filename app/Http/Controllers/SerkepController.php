<?php

namespace App\Http\Controllers;

use App\Models\Serkep;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SerkepController extends Controller
{
    public function index(Request $request)
    {
        $query = Serkep::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('jenis_naskah')) {
            $query->where('jenis_naskah', $request->jenis_naskah);
        }

        return Inertia::render('Serkep/Index', [
            'serkeps' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('status', 'jenis_naskah'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Serkep/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nomor'           => 'required|string|max:100|unique:serkeps,nomor',
            'title'           => 'required|string|max:255',
            'jenis_naskah'    => 'required|string|max:100',
            'klasifikasi'     => 'nullable|string|max:100',
            'status'          => 'required|string|max:50',
            'pemrakarsa_div'  => 'nullable|string|max:100',
            'effective_date'  => 'nullable|date',
            'version'         => 'nullable|integer',
            'page_count'      => 'nullable|integer',
            'replaces_id'     => 'nullable|exists:serkeps,id',
            'sla_due_at'      => 'nullable|date',
            'signer'          => 'nullable|string|max:100',
            'draft_file_path' => 'nullable|string|max:500',
            'final_file_path' => 'nullable|string|max:500',
        ]);

        $data['created_by'] = auth()->id();

        Serkep::create($data);

        return redirect()->route('serkep.index')->with('success', 'Serkep berhasil ditambahkan.');
    }

    public function show(Serkep $serkep)
    {
        $serkep->load(['policies', 'reviewTasks', 'disposisis', 'aiReviews']);

        return Inertia::render('Serkep/Show', [
            'serkep' => $serkep,
        ]);
    }

    public function edit(Serkep $serkep)
    {
        return Inertia::render('Serkep/Edit', [
            'serkep' => $serkep,
        ]);
    }

    public function update(Request $request, Serkep $serkep)
    {
        $data = $request->validate([
            'nomor'           => 'required|string|max:100|unique:serkeps,nomor,' . $serkep->id,
            'title'           => 'required|string|max:255',
            'jenis_naskah'    => 'required|string|max:100',
            'klasifikasi'     => 'nullable|string|max:100',
            'status'          => 'required|string|max:50',
            'pemrakarsa_div'  => 'nullable|string|max:100',
            'effective_date'  => 'nullable|date',
            'version'         => 'nullable|integer',
            'page_count'      => 'nullable|integer',
            'replaces_id'     => 'nullable|exists:serkeps,id',
            'sla_due_at'      => 'nullable|date',
            'signer'          => 'nullable|string|max:100',
            'draft_file_path' => 'nullable|string|max:500',
            'final_file_path' => 'nullable|string|max:500',
        ]);

        $serkep->update($data);

        return redirect()->route('serkep.show', $serkep)->with('success', 'Serkep berhasil diperbarui.');
    }

    public function destroy(Serkep $serkep)
    {
        $serkep->delete();

        return redirect()->route('serkep.index')->with('success', 'Serkep berhasil dihapus.');
    }

    public function trash(Request $request)
    {
        $serkeps = Serkep::onlyTrashed()->latest()->paginate(20)->withQueryString();

        return Inertia::render('Serkep/Trash', [
            'serkeps' => $serkeps,
        ]);
    }

    public function restore($id)
    {
        $serkep = Serkep::onlyTrashed()->findOrFail($id);
        $serkep->restore();

        return redirect()->route('serkep.trash')->with('success', 'Serkep berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $serkep = Serkep::onlyTrashed()->findOrFail($id);
        $serkep->forceDelete();

        return redirect()->route('serkep.trash')->with('success', 'Serkep berhasil dihapus permanen.');
    }
}
