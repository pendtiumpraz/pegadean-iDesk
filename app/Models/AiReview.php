<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'serkep_id',
        'version',
        'analysis_duration_s',
        'total_findings',
        'total_suggestions',
        'total_references',
        'ai_model',
    ];

    protected function casts(): array
    {
        return [
            'version'             => 'integer',
            'analysis_duration_s' => 'integer',
            'total_findings'      => 'integer',
            'total_suggestions'   => 'integer',
            'total_references'    => 'integer',
        ];
    }

    public function serkep()
    {
        return $this->belongsTo(Serkep::class);
    }

    public function findings()
    {
        return $this->hasMany(AiFinding::class);
    }
}
