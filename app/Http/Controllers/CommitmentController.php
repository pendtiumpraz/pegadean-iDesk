<?php

namespace App\Http\Controllers;

use App\Models\Commitment;
use App\Models\Serkep;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommitmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Commitment::with(['serkep']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Commitment/Index', [
            'commitments' => $query->latest()->paginate(20)->withQueryString(),
            'filters'     => $request->only('status'),
        ]);
    }

    public function create()
    {
        $serkeps = Serkep::select('id', 'nomor', 'title')->get();

        return Inertia::render('Commitment/Create', [
            'serkeps' => $serkeps,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description'    => 'required|string',
            'status'         => 'required|string|max:50',
            'target_quarter' => 'nullable|string|max:20',
            'serkep_id'      => 'nullable|exists:serkeps,id',
        ]);

        Commitment::create($data);

        return redirect()->route('commitments.index')->with('success', 'Komitmen berhasil ditambahkan.');
    }

    public function show(Commitment $comm)
    {
        $comm->load(['serkep']);

        return Inertia::render('Commitment/Show', [
            'commitment' => $comm,
        ]);
    }

    public function update(Request $request, Commitment $comm)
    {
        $data = $request->validate([
            'description'    => 'required|string',
            'status'         => 'required|string|max:50',
            'target_quarter' => 'nullable|string|max:20',
            'serkep_id'      => 'nullable|exists:serkeps,id',
        ]);

        $comm->update($data);

        return redirect()->route('commitments.show', $comm)->with('success', 'Komitmen berhasil diperbarui.');
    }

    public function destroy(Commitment $comm)
    {
        $comm->delete();

        return redirect()->route('commitments.index')->with('success', 'Komitmen berhasil dihapus.');
    }
}
