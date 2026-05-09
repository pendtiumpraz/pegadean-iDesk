<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('integration_pipelines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('integration_id');
            $table->string('name');
            $table->string('trigger_event');
            $table->string('frequency', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['integration_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('integration_pipelines'); }
};
