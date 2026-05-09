<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AmlAlert extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'waktu',
        'nasabah_masked',
        'tipe_transaksi',
        'nominal',
        'skor',
        'risk_level',
        'alert_status',
        'tipologi',
        'is_str_submitted',
        'source_system',
    ];

    protected function casts(): array
    {
        return [
            'waktu'           => 'datetime',
            'skor'            => 'integer',
            'is_str_submitted' => 'boolean',
        ];
    }

    public function strReports()
    {
        return $this->hasMany(StrReport::class);
    }
}
