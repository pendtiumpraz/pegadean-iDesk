<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Integration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'status',
        'last_sync_at',
        'next_sync_at',
        'endpoint_url',
        'webhook_url',
        'health_score',
        'is_critical',
        'flows_json',
        'config_json',
    ];

    protected function casts(): array
    {
        return [
            'last_sync_at' => 'datetime',
            'next_sync_at' => 'datetime',
            'flows_json'   => 'array',
            'config_json'  => 'array',
            'is_critical'  => 'boolean',
            'health_score' => 'decimal:2',
        ];
    }

    public function pipelines()
    {
        return $this->hasMany(IntegrationPipeline::class);
    }
}
