<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('review_task_reviewers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('review_task_id');
            $table->unsignedBigInteger('user_id');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['review_task_id','user_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('review_task_reviewers'); }
};
