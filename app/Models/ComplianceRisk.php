<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplianceRisk extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'risk_code',
        'category',
        'description',
        'owner_div',
        'likelihood',
        'impact',
        'inherent_score',
        'residual_score',
        'control_count',
        'control_desc',
        'pic_user_id',
        'target_date',
        'status',
        'source',
        'serkep_id',
    ];

    protected function casts(): array
    {
        return [
            'inherent_score' => 'integer',
            'residual_score' => 'integer',
            'control_count'  => 'integer',
            'target_date'    => 'date',
        ];
    }

    public function picUser()
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    public function serkep()
    {
        return $this->belongsTo(Serkep::class);
    }
}
