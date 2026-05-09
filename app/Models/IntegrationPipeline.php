<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IntegrationPipeline extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'integration_id',
        'name',
        'trigger_event',
        'frequency',
        'is_active',
        'last_run_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active'   => 'boolean',
            'last_run_at' => 'datetime',
        ];
    }

    public function integration()
    {
        return $this->belongsTo(Integration::class);
    }
}
