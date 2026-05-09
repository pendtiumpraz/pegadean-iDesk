<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commitment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'description',
        'status',
        'target_quarter',
        'serkep_id',
    ];

    public function serkep()
    {
        return $this->belongsTo(Serkep::class);
    }
}
