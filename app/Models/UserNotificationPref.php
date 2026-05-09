<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UserNotificationPref extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'event_type',
        'channel_email',
        'channel_inapp',
        'channel_whatsapp',
        'is_enabled',
    ];

    protected function casts(): array
    {
        return [
            'channel_email'    => 'boolean',
            'channel_inapp'    => 'boolean',
            'channel_whatsapp' => 'boolean',
            'is_enabled'       => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
