<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('serkeps', function (Blueprint $table) {
            $table->id();
            $table->string('nomor', 30)->nullable()->unique();
            $table->text('title');
            $table->enum('jenis_naskah', ['SERKEP','SE','SK','pedoman_kebijakan']);
            $table->enum('klasifikasi', ['internal','terbatas','rahasia'])->default('internal');
            $table->enum('status', ['draft','review','kajian','approve','released'])->default('draft');
            $table->string('pemrakarsa_div');
            $table->date('effective_date')->nullable();
            $table->tinyInteger('version')->unsigned()->default(1);
            $table->smallInteger('page_count')->unsigned()->nullable();
            $table->unsignedBigInteger('replaces_id')->nullable();
            $table->enum('ai_risk_score', ['high','med','low'])->nullable();
            $table->timestamp('sla_due_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->string('signer')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->string('draft_file_path', 500)->nullable();
            $table->string('final_file_path', 500)->nullable();
            $table->unsignedBigInteger('created_by');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['status','pemrakarsa_div','ai_risk_score','sla_due_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('serkeps'); }
};
