<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key'         => 'ai_review_enabled',
                'value'       => 'false',
                'type'        => 'boolean',
                'group'       => 'ai',
                'description' => 'Aktifkan fitur AI review kebijakan',
            ],
            [
                'key'         => 'ai_provider',
                'value'       => 'openai',
                'type'        => 'string',
                'group'       => 'ai',
                'description' => 'Provider AI (openai, gemini, claude)',
            ],
            [
                'key'         => 'ai_model',
                'value'       => 'gpt-4o',
                'type'        => 'string',
                'group'       => 'ai',
                'description' => 'Model AI yang digunakan',
            ],
            [
                'key'         => 'policy_review_days',
                'value'       => '30',
                'type'        => 'integer',
                'group'       => 'policy',
                'description' => 'SLA review kebijakan (hari)',
            ],
            [
                'key'         => 'max_upload_mb',
                'value'       => '20',
                'type'        => 'integer',
                'group'       => 'upload',
                'description' => 'Ukuran maksimum upload file (MB)',
            ],
            [
                'key'         => 'allowed_extensions',
                'value'       => 'pdf,docx,xlsx',
                'type'        => 'string',
                'group'       => 'upload',
                'description' => 'Ekstensi file yang diizinkan',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
