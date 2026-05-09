<?php

namespace App\Http\Controllers;

use App\Models\AiReview;
use App\Models\Policy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AiReviewController extends Controller
{
    public function index(Request $request)
    {
        $reviews = AiReview::with(['serkep'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('AiReview/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function show(AiReview $review)
    {
        $review->load(['serkep', 'findings']);

        return Inertia::render('AiReview/Show', [
            'review' => $review,
        ]);
    }

    public function runForPolicy(Request $request, Policy $policy)
    {
        $serkep = $policy->serkeps()->latest()->first();

        if (!$serkep) {
            return redirect()->route('policies.show', $policy)->with('error', 'Kebijakan ini belum memiliki serkep terkait.');
        }

        AiReview::create([
            'serkep_id' => $serkep->id,
            'version'   => 1,
            'ai_model'  => 'pending',
        ]);

        return redirect()->route('policies.show', $policy)->with('success', 'AI review dijadwalkan untuk kebijakan ini.');
    }
}
