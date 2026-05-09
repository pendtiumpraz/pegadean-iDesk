<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('ai_findings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ai_review_id');
            $table->tinyInteger('finding_number')->unsigned();
            $table->enum('severity', ['high','med','low']);
            $table->string('pasal_ref', 100)->nullable();
            $table->string('title', 500);
            $table->text('body');
            $table->text('quote')->nullable();
            $table->json('references_json')->nullable();
            $table->enum('status', ['pending','accepted','discussed','ignored'])->default('pending');
            $table->unsignedBigInteger('actioned_by')->nullable();
            $table->timestamp('actioned_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['ai_review_id','severity','status']);
        });
    }
    public function down(): void { Schema::dropIfExists('ai_findings'); }
};
