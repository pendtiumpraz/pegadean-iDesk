<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReviewTask extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'serkep_id',
        'step',
        'step_order',
        'status',
        'assignee_id',
        'sla_due_at',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'step_order'   => 'integer',
            'sla_due_at'   => 'datetime',
            'started_at'   => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function serkep()
    {
        return $this->belongsTo(Serkep::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function reviewers()
    {
        return $this->hasMany(ReviewTaskReviewer::class);
    }

    public function disposisis()
    {
        return $this->hasMany(Disposisi::class);
    }
}
