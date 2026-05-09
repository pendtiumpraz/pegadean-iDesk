<?php

namespace App\Http\Controllers;

use App\Models\Disposisi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisposisiController extends Controller
{
    public function index(Request $request)
    {
        $disposisis = Disposisi::with(['fromUser', 'serkep', 'reviewTask'])
            ->where('to_user_id', auth()->id())
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Disposisi/Index', [
            'disposisis' => $disposisis,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'review_task_id' => 'nullable|exists:review_tasks,id',
            'serkep_id'      => 'nullable|exists:serkeps,id',
            'to_user_id'     => 'required|exists:users,id',
            'title'          => 'required|string|max:255',
            'preview'        => 'nullable|string|max:500',
            'type'           => 'required|string|max:50',
            'is_urgent'      => 'boolean',
            'body_html'      => 'nullable|string',
            'sla_due_at'     => 'nullable|date',
        ]);

        $data['from_user_id'] = auth()->id();
        $data['is_read']      = false;

        Disposisi::create($data);

        return redirect()->route('disposisi.index')->with('success', 'Disposisi berhasil dikirim.');
    }

    public function show(Disposisi $disposisi)
    {
        $disposisi->load(['fromUser', 'toUser', 'serkep', 'reviewTask']);

        return Inertia::render('Disposisi/Show', [
            'disposisi' => $disposisi,
        ]);
    }

    public function markRead(Disposisi $disposisi)
    {
        $disposisi->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return redirect()->route('disposisi.show', $disposisi)->with('success', 'Disposisi ditandai sudah dibaca.');
    }
}
