<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('review_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('serkep_id');
            $table->enum('step', ['pengajuan','review_kadep','review_cpp','kajian_hukum','pengesahan','penomoran','penerbitan']);
            $table->tinyInteger('step_order')->unsigned();
            $table->enum('status', ['pending','current','done','skipped'])->default('pending');
            $table->unsignedBigInteger('assignee_id')->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['serkep_id','step','status','assignee_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('review_tasks'); }
};
