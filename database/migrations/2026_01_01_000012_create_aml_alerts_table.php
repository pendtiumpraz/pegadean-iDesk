<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('aml_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id', 30)->unique();
            $table->timestamp('waktu');
            $table->string('nasabah_masked');
            $table->enum('tipe_transaksi', ['tunai_keluar','transfer','penarikan_emas','setor_tunai','topup_emas']);
            $table->string('nominal', 100);
            $table->tinyInteger('skor')->unsigned();
            $table->enum('risk_level', ['high','med','low']);
            $table->enum('alert_status', ['EDD','STR_draft','tinjau','verifikasi']);
            $table->enum('tipologi', ['structuring','cash_intensive','high_velocity','cross_border','pep_transactions'])->nullable();
            $table->boolean('is_str_submitted')->default(false);
            $table->string('source_system', 100)->default('PERISAI');
            $table->softDeletes();
            $table->timestamps();
            $table->index(['risk_level','alert_status']);
        });
    }
    public function down(): void { Schema::dropIfExists('aml_alerts'); }
};
