<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PolicyEmbedding extends Model
{
    use HasFactory;

    protected $fillable = [
        'policy_id',
        'chunk_text',
        'chunk_index',
    ];

    protected function casts(): array
    {
        return [
            'chunk_index' => 'integer',
        ];
    }

    public function policy()
    {
        return $this->belongsTo(Policy::class);
    }
}
