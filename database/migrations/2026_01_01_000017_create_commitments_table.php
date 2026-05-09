<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('commitments', function (Blueprint $table) {
            $table->id();
            $table->text('description');
            $table->enum('status', ['tercapai','on_track','terlambat'])->default('on_track');
            $table->string('target_quarter', 10)->nullable();
            $table->unsignedBigInteger('serkep_id')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['status','serkep_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('commitments'); }
};
