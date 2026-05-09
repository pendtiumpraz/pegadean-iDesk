<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('user_system_access', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('system_name', 100);
            $table->softDeletes();
            $table->timestamps();
            $table->index(['user_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('user_system_access'); }
};
