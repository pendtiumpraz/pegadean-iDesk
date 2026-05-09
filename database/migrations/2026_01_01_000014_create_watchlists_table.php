<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('watchlists', function (Blueprint $table) {
            $table->id();
            $table->string('source_name');
            $table->unsignedInteger('entity_count')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->enum('update_type', ['auto','manual'])->default('auto');
            $table->softDeletes();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('watchlists'); }
};
