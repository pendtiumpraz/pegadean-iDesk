<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Watchlist extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'source_name',
        'entity_count',
        'last_synced_at',
        'update_type',
    ];

    protected function casts(): array
    {
        return [
            'entity_count'   => 'integer',
            'last_synced_at' => 'datetime',
        ];
    }
}
