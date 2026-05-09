<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            if (!Schema::hasColumn('integrations', 'slug')) {
                $table->string('slug', 80)->nullable()->after('name')->unique();
            }
            if (!Schema::hasColumn('integrations', 'category')) {
                $table->string('category', 40)->default('compliance')->after('description');
            }
            if (!Schema::hasColumn('integrations', 'next_sync_at')) {
                $table->timestamp('next_sync_at')->nullable()->after('last_sync_at');
            }
            if (!Schema::hasColumn('integrations', 'endpoint_url')) {
                $table->string('endpoint_url', 255)->nullable()->after('next_sync_at');
            }
            if (!Schema::hasColumn('integrations', 'webhook_url')) {
                $table->string('webhook_url', 255)->nullable()->after('endpoint_url');
            }
            if (!Schema::hasColumn('integrations', 'health_score')) {
                $table->decimal('health_score', 5, 2)->default(0)->after('webhook_url');
            }
            if (!Schema::hasColumn('integrations', 'is_critical')) {
                $table->boolean('is_critical')->default(false)->after('health_score');
            }
        });
    }

    public function down(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            foreach (['slug','category','next_sync_at','endpoint_url','webhook_url','health_score','is_critical'] as $col) {
                if (Schema::hasColumn('integrations', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
