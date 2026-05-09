<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('policies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->text('title');
            $table->enum('type', ['induk','anak','eksternal']);
            $table->string('category', 100);
            $table->string('version', 20)->nullable();
            $table->date('effective_date')->nullable();
            $table->enum('status', ['aktif','review','obsolete'])->default('aktif');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->text('summary')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('pasal_ref')->nullable();
            $table->string('owner_div')->nullable();
            $table->string('pengesah')->nullable();
            $table->string('file_path', 500)->nullable();
            $table->unsignedInteger('linked_serkep_count')->default(0);
            $table->softDeletes();
            $table->timestamps();
            $table->index(['code','type','category','status','parent_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('policies'); }
};
