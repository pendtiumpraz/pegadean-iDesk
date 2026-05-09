<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Serkep extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nomor',
        'title',
        'jenis_naskah',
        'klasifikasi',
        'status',
        'pemrakarsa_div',
        'effective_date',
        'version',
        'page_count',
        'replaces_id',
        'ai_risk_score',
        'sla_due_at',
        'submitted_at',
        'signed_at',
        'signer',
        'released_at',
        'draft_file_path',
        'final_file_path',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'version'        => 'integer',
            'page_count'     => 'integer',
            'sla_due_at'     => 'datetime',
            'submitted_at'   => 'datetime',
            'signed_at'      => 'datetime',
            'released_at'    => 'datetime',
        ];
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function replacedBy()
    {
        return $this->belongsTo(Serkep::class, 'replaces_id');
    }

    public function policies()
    {
        return $this->belongsToMany(Policy::class, 'serkep_policies');
    }

    public function reviewTasks()
    {
        return $this->hasMany(ReviewTask::class);
    }

    public function disposisis()
    {
        return $this->hasMany(Disposisi::class);
    }

    public function aiReviews()
    {
        return $this->hasMany(AiReview::class);
    }

    public function complianceRisks()
    {
        return $this->hasMany(ComplianceRisk::class);
    }

    public function commitments()
    {
        return $this->hasMany(Commitment::class);
    }
}
