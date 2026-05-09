<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::dropIfExists('compliance_risks');
        Schema::create('compliance_risks', function (Blueprint $table) {
            $table->id();
            $table->string('risk_code', 20)->unique();
            $table->enum('category', ['operasional','aml','ti','hukum','regulasi','fraud','strategis','reputasi']);
            $table->text('description');
            $table->string('owner_div');
            $table->enum('likelihood', ['tinggi','sedang','rendah']);
            $table->enum('impact', ['tinggi','sedang','rendah']);
            $table->tinyInteger('inherent_score')->unsigned();
            $table->tinyInteger('residual_score')->unsigned();
            $table->tinyInteger('control_count')->unsigned()->default(0);
            $table->text('control_desc')->nullable();
            $table->unsignedBigInteger('pic_user_id')->nullable();
            $table->date('target_date')->nullable();
            $table->enum('status', ['aktif','mitigasi','monitor'])->default('aktif');
            $table->enum('source', ['BeComply','RCS','komite'])->default('RCS');
            $table->unsignedBigInteger('serkep_id')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['risk_code','category','status','inherent_score','residual_score'], 'idx_compliance_risks_main');
        });
    }
    public function down(): void { Schema::dropIfExists('compliance_risks'); }
};
