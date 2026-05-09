<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Policy extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'title',
        'type',
        'category',
        'version',
        'effective_date',
        'status',
        'parent_id',
        'summary',
        'excerpt',
        'pasal_ref',
        'owner_div',
        'pengesah',
        'file_path',
        'linked_serkep_count',
    ];

    protected function casts(): array
    {
        return [
            'effective_date'      => 'date',
            'linked_serkep_count' => 'integer',
        ];
    }

    public function parent()
    {
        return $this->belongsTo(Policy::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Policy::class, 'parent_id');
    }

    public function embeddings()
    {
        return $this->hasMany(PolicyEmbedding::class);
    }

    public function serkeps()
    {
        return $this->belongsToMany(Serkep::class, 'serkep_policies');
    }
}
