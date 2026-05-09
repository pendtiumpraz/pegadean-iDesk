<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewTaskReviewer extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_task_id',
        'user_id',
    ];

    public function reviewTask()
    {
        return $this->belongsTo(ReviewTask::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
