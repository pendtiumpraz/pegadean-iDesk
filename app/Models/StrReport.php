<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StrReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'aml_alert_id',
        'status',
        'submitted_at',
        'submitted_by',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
        ];
    }

    public function amlAlert()
    {
        return $this->belongsTo(AmlAlert::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
