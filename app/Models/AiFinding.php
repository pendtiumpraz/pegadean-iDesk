<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiFinding extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ai_review_id',
        'finding_number',
        'severity',
        'pasal_ref',
        'title',
        'body',
        'quote',
        'references_json',
        'status',
        'actioned_by',
        'actioned_at',
    ];

    protected function casts(): array
    {
        return [
            'finding_number'  => 'integer',
            'references_json' => 'array',
            'actioned_at'     => 'datetime',
        ];
    }

    public function aiReview()
    {
        return $this->belongsTo(AiReview::class);
    }

    public function actionedBy()
    {
        return $this->belongsTo(User::class, 'actioned_by');
    }
}
