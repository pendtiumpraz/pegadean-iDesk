<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Disposisi extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'review_task_id',
        'serkep_id',
        'from_user_id',
        'to_user_id',
        'title',
        'preview',
        'type',
        'is_urgent',
        'is_read',
        'body_html',
        'decision',
        'decided_at',
        'decision_note',
        'sla_due_at',
    ];

    protected function casts(): array
    {
        return [
            'is_urgent'   => 'boolean',
            'is_read'     => 'boolean',
            'decided_at'  => 'datetime',
            'sla_due_at'  => 'datetime',
        ];
    }

    public function reviewTask()
    {
        return $this->belongsTo(ReviewTask::class);
    }

    public function serkep()
    {
        return $this->belongsTo(Serkep::class);
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
