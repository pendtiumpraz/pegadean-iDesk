<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('user_notification_prefs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('event_type');
            $table->boolean('channel_email')->default(true);
            $table->boolean('channel_inapp')->default(true);
            $table->boolean('channel_whatsapp')->default(false);
            $table->boolean('is_enabled')->default(true);
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['user_id','event_type']);
        });
    }
    public function down(): void { Schema::dropIfExists('user_notification_prefs'); }
};
