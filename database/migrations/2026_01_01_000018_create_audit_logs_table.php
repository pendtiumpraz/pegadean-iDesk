<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->enum('actor_type', ['user','system'])->default('user');
            $table->string('actor_name')->nullable();
            $table->string('action', 500);
            $table->string('entity_type', 100)->nullable();
            $table->string('entity_id', 100)->nullable();
            $table->json('metadata_json')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['actor_id','entity_type','created_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('audit_logs'); }
};
