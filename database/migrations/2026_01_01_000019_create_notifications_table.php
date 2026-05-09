<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('event_type');
            $table->string('title', 500);
            $table->text('body')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->string('action_url', 500)->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['user_id','is_read']);
        });
    }
    public function down(): void { Schema::dropIfExists('notifications'); }
};
