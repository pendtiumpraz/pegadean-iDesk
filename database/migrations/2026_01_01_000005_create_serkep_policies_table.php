<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('serkep_policies', function (Blueprint $table) {
            $table->unsignedBigInteger('serkep_id');
            $table->unsignedBigInteger('policy_id');
            $table->primary(['serkep_id','policy_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('serkep_policies'); }
};
