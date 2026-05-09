<?php

namespace App\Http\Controllers;

use App\Models\Policy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PolicyController extends Controller
{
    public function index(Request $request)
    {
        $query = Policy::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Policy/Index', [
            'policies' => $query->latest()->paginate(20)->withQueryString(),
            'filters'  => $request->only('category', 'status'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Policy/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'           => 'required|string|max:50|unique:policies,code',
            'title'          => 'required|string|max:255',
            'type'           => 'required|string|max:100',
            'category'       => 'required|string|max:100',
            'version'        => 'nullable|string|max:20',
            'effective_date' => 'nullable|date',
            'status'         => 'required|string|max:50',
            'parent_id'      => 'nullable|exists:policies,id',
            'summary'        => 'nullable|string',
            'excerpt'        => 'nullable|string',
            'pasal_ref'      => 'nullable|string|max:255',
            'owner_div'      => 'nullable|string|max:100',
            'pengesah'       => 'nullable|string|max:100',
            'file_path'      => 'nullable|string|max:500',
        ]);

        Policy::create($data);

        return redirect()->route('policies.index')->with('success', 'Kebijakan berhasil ditambahkan.');
    }

    public function show(Policy $policy)
    {
        $policy->load(['serkeps', 'serkeps.aiReviews', 'serkeps.reviewTasks']);

        return Inertia::render('Policy/Show', [
            'policy' => $policy,
        ]);
    }

    public function edit(Policy $policy)
    {
        return Inertia::render('Policy/Edit', [
            'policy' => $policy,
        ]);
    }

    public function update(Request $request, Policy $policy)
    {
        $data = $request->validate([
            'code'           => 'required|string|max:50|unique:policies,code,' . $policy->id,
            'title'          => 'required|string|max:255',
            'type'           => 'required|string|max:100',
            'category'       => 'required|string|max:100',
            'version'        => 'nullable|string|max:20',
            'effective_date' => 'nullable|date',
            'status'         => 'required|string|max:50',
            'parent_id'      => 'nullable|exists:policies,id',
            'summary'        => 'nullable|string',
            'excerpt'        => 'nullable|string',
            'pasal_ref'      => 'nullable|string|max:255',
            'owner_div'      => 'nullable|string|max:100',
            'pengesah'       => 'nullable|string|max:100',
            'file_path'      => 'nullable|string|max:500',
        ]);

        $policy->update($data);

        return redirect()->route('policies.show', $policy)->with('success', 'Kebijakan berhasil diperbarui.');
    }

    public function destroy(Policy $policy)
    {
        $policy->delete();

        return redirect()->route('policies.index')->with('success', 'Kebijakan berhasil dihapus.');
    }

    public function trash(Request $request)
    {
        $policies = Policy::onlyTrashed()->latest()->paginate(20)->withQueryString();

        return Inertia::render('Policy/Trash', [
            'policies' => $policies,
        ]);
    }

    public function restore($id)
    {
        $policy = Policy::onlyTrashed()->findOrFail($id);
        $policy->restore();

        return redirect()->route('policies.trash')->with('success', 'Kebijakan berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $policy = Policy::onlyTrashed()->findOrFail($id);
        $policy->forceDelete();

        return redirect()->route('policies.trash')->with('success', 'Kebijakan berhasil dihapus permanen.');
    }
}
