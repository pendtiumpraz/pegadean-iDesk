<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('disposisis', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('review_task_id');
            $table->unsignedBigInteger('serkep_id');
            $table->unsignedBigInteger('from_user_id');
            $table->unsignedBigInteger('to_user_id');
            $table->string('title', 500);
            $table->text('preview')->nullable();
            $table->enum('type', ['approve','high','review','kajian']);
            $table->boolean('is_urgent')->default(false);
            $table->boolean('is_read')->default(false);
            $table->text('body_html')->nullable();
            $table->enum('decision', ['approved','rejected','forwarded','clarification'])->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['to_user_id','is_read','serkep_id','type']);
        });
    }
    public function down(): void { Schema::dropIfExists('disposisis'); }
};
