<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('portal_user_id')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('nip', 30)->nullable();
            $table->string('jabatan')->nullable();
            $table->string('divisi')->nullable();
            $table->string('no_ekstensi', 20)->nullable();
            $table->string('avatar_initials', 5)->nullable();
            $table->string('photo_path', 500)->nullable();
            $table->enum('status', ['aktif','cuti','non_aktif'])->default('aktif');
            $table->boolean('mfa_enabled')->default(false);
            $table->timestamp('last_login_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }
    public function down(): void {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('users');
    }
};
