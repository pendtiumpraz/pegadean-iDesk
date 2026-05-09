<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('policy_embeddings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('policy_id');
            $table->text('chunk_text');
            $table->tinyInteger('chunk_index')->unsigned()->default(0);
            $table->timestamps();
            $table->index(['policy_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('policy_embeddings'); }
};
