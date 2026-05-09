<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SerkepPolicy extends Pivot
{
    use HasFactory;

    public $incrementing = false;
    public $timestamps = false;

    protected $table = 'serkep_policies';

    protected $fillable = [
        'serkep_id',
        'policy_id',
    ];
}
