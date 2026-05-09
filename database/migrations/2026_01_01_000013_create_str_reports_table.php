<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('str_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('aml_alert_id');
            $table->enum('status', ['draft','submitted','confirmed','rejected'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->unsignedBigInteger('submitted_by')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['aml_alert_id','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('str_reports'); }
};
