<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'portal_user_id',
        'name',
        'email',
        'password',
        'nip',
        'jabatan',
        'divisi',
        'no_ekstensi',
        'avatar_initials',
        'photo_path',
        'status',
        'mfa_enabled',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'mfa_enabled'    => 'boolean',
            'last_login_at'  => 'datetime',
            'password'       => 'hashed',
        ];
    }

    public function systemAccess()
    {
        return $this->hasMany(UserSystemAccess::class);
    }

    public function notificationPrefs()
    {
        return $this->hasMany(UserNotificationPref::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function reviewTasks()
    {
        return $this->hasMany(ReviewTask::class, 'assignee_id');
    }

    public function reviewTaskReviewers()
    {
        return $this->hasMany(ReviewTaskReviewer::class);
    }

    public function disposisisFrom()
    {
        return $this->hasMany(Disposisi::class, 'from_user_id');
    }

    public function disposisisTo()
    {
        return $this->hasMany(Disposisi::class, 'to_user_id');
    }

    public function complianceRisks()
    {
        return $this->hasMany(ComplianceRisk::class, 'pic_user_id');
    }
}
