<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ai_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('serkep_id');
            $table->tinyInteger('version')->unsigned();
            $table->unsignedInteger('analysis_duration_s')->nullable();
            $table->tinyInteger('total_findings')->unsigned()->default(0);
            $table->tinyInteger('total_suggestions')->unsigned()->default(0);
            $table->tinyInteger('total_references')->unsigned()->default(0);
            $table->string('ai_model', 100)->nullable();
            $table->timestamps();
            $table->index(['serkep_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('ai_reviews'); }
};
