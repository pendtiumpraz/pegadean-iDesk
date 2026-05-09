<?php

namespace App\Http\Controllers;

use App\Models\ReviewTask;
use App\Models\Serkep;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewTaskController extends Controller
{
    public function index(Request $request)
    {
        $query = ReviewTask::with(['serkep', 'assignee']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assignee_id')) {
            $query->where('assignee_id', $request->assignee_id);
        }

        return Inertia::render('ReviewTask/Index', [
            'tasks'   => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $request->only('status', 'assignee_id'),
        ]);
    }

    public function create(Request $request)
    {
        $serkeps = Serkep::select('id', 'nomor', 'title')->get();

        return Inertia::render('ReviewTask/Create', [
            'serkeps'    => $serkeps,
            'serkep_id'  => $request->serkep_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'serkep_id'   => 'required|exists:serkeps,id',
            'step'        => 'required|string|max:100',
            'step_order'  => 'required|integer|min:1',
            'status'      => 'required|string|max:50',
            'assignee_id' => 'nullable|exists:users,id',
            'sla_due_at'  => 'nullable|date',
        ]);

        ReviewTask::create($data);

        return redirect()->route('reviews.index')->with('success', 'Tugas review berhasil dibuat.');
    }

    public function show(ReviewTask $task)
    {
        $task->load(['serkep', 'assignee', 'reviewers.user']);

        return Inertia::render('ReviewTask/Show', [
            'task' => $task,
        ]);
    }

    public function update(Request $request, ReviewTask $task)
    {
        $data = $request->validate([
            'step'        => 'sometimes|required|string|max:100',
            'step_order'  => 'sometimes|required|integer|min:1',
            'status'      => 'sometimes|required|string|max:50',
            'assignee_id' => 'nullable|exists:users,id',
            'sla_due_at'  => 'nullable|date',
            'started_at'  => 'nullable|date',
        ]);

        $task->update($data);

        return redirect()->route('reviews.show', $task)->with('success', 'Tugas review berhasil diperbarui.');
    }

    public function complete(Request $request, ReviewTask $task)
    {
        $task->update([
            'status'       => 'selesai',
            'completed_at' => now(),
        ]);

        return redirect()->route('reviews.show', $task)->with('success', 'Tugas review ditandai selesai.');
    }

    public function destroy(ReviewTask $task)
    {
        $task->delete();

        return redirect()->route('reviews.index')->with('success', 'Tugas review berhasil dihapus.');
    }
}
