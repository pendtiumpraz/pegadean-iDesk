<?php

namespace Database\Seeders;

use App\Models\Integration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class IntegrationSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'name'         => 'BeComply',
                'slug'         => 'becomply',
                'description'  => 'Compliance Enabling System — induk alur kepatuhan SERKEP, RCS, dan Komitmen.',
                'category'     => 'compliance',
                'status'       => 'connected',
                'last_sync_at' => Carbon::now()->subMinutes(2),
                'next_sync_at' => Carbon::now()->addMinutes(28),
                'endpoint_url' => 'https://api.becomply.pegadean.id/v2',
                'webhook_url'  => 'https://api.idesk.pegadean/v2/hooks/becomply',
                'health_score' => 99.20,
                'is_critical'  => true,
                'flows_json'   => ['SERKEP', 'RCS', 'Komitmen'],
                'config_json'  => ['cron' => '*/30 * * * *', 'timeout' => 30, 'retries' => 3],
            ],
            [
                'name'         => 'RCS',
                'slug'         => 'rcs',
                'description'  => 'Risk Control Self-Assessment — register risiko dan rencana mitigasi.',
                'category'     => 'compliance',
                'status'       => 'connected',
                'last_sync_at' => Carbon::now()->subMinutes(5),
                'next_sync_at' => Carbon::now()->addMinutes(25),
                'endpoint_url' => 'https://api.rcs.pegadean.id/v1',
                'webhook_url'  => 'https://api.idesk.pegadean/v2/hooks/rcs',
                'health_score' => 97.80,
                'is_critical'  => true,
                'flows_json'   => ['Risk Register', 'Mitigasi'],
                'config_json'  => ['cron' => '*/30 * * * *', 'timeout' => 30],
            ],
            [
                'name'         => 'APASI',
                'slug'         => 'apasi',
                'description'  => 'Aplikasi Pelaporan Gratifikasi — pelaporan & verifikasi.',
                'category'     => 'compliance',
                'status'       => 'connected',
                'last_sync_at' => Carbon::now()->subMinutes(17),
                'next_sync_at' => Carbon::now()->addMinutes(43),
                'endpoint_url' => 'https://api.apasi.pegadean.id/v1',
                'webhook_url'  => 'https://api.idesk.pegadean/v2/hooks/apasi',
                'health_score' => 95.10,
                'is_critical'  => false,
                'flows_json'   => ['Pelaporan', 'Verifikasi'],
                'config_json'  => ['cron' => '0 */1 * * *'],
            ],
            [
                'name'         => 'SIMPEL',
                'slug'         => 'simpel',
                'description'  => 'Repositori Kebijakan Perusahaan — versioning kebijakan internal.',
                'category'     => 'reporting',
                'status'       => 'connected',
                'last_sync_at' => Carbon::now()->subHour(),
                'next_sync_at' => Carbon::now()->addHours(5),
                'endpoint_url' => 'https://api.simpel.pegadean.id/v1',
                'webhook_url'  => 'https://api.idesk.pegadean/v2/hooks/simpel',
                'health_score' => 92.40,
                'is_critical'  => false,
                'flows_json'   => ['Repository', 'Versioning'],
                'config_json'  => ['cron' => '0 */6 * * *'],
            ],
            [
                'name'         => 'PERISAI',
                'slug'         => 'perisai',
                'description'  => 'AML-CFT Information System — alert engine & STR pipeline.',
                'category'     => 'compliance',
                'status'       => 'connected',
                'last_sync_at' => Carbon::now()->subSeconds(8),
                'next_sync_at' => Carbon::now()->addSeconds(52),
                'endpoint_url' => 'https://api.perisai.pegadean.id/v3',
                'webhook_url'  => 'https://api.idesk.pegadean/v2/hooks/perisai',
                'health_score' => 99.90,
                'is_critical'  => true,
                'flows_json'   => ['Alert', 'STR'],
                'config_json'  => ['cron' => '* * * * *'],
            ],
            [
                'name'         => 'E-Office',
                'slug'         => 'e-office',
                'description'  => 'Disposisi & alur naskah dinas — penomoran resmi.',
                'category'     => 'document',
                'status'       => 'connected',
                'last_sync_at' => Carbon::now()->subMinutes(3),
                'next_sync_at' => Carbon::now()->addMinutes(27),
                'endpoint_url' => 'https://api.eoffice.pegadean.id/v2',
                'webhook_url'  => 'https://api.idesk.pegadean/v2/hooks/eoffice',
                'health_score' => 96.50,
                'is_critical'  => false,
                'flows_json'   => ['Disposisi', 'Penomoran'],
                'config_json'  => ['cron' => '*/30 * * * *'],
            ],
            [
                'name'         => 'PPATK Reporting',
                'slug'         => 'ppatk',
                'description'  => 'Pelaporan transaksi mencurigakan ke PPATK (STR/LTKT).',
                'category'     => 'reporting',
                'status'       => 'limited',
                'last_sync_at' => Carbon::now()->subDay(),
                'next_sync_at' => null,
                'endpoint_url' => 'https://gripps.ppatk.go.id/api/v2',
                'webhook_url'  => null,
                'health_score' => 64.00,
                'is_critical'  => true,
                'flows_json'   => ['STR', 'LTKT'],
                'config_json'  => ['needs_credential' => true],
            ],
            [
                'name'         => 'OJK Regulasi',
                'slug'         => 'ojk',
                'description'  => 'Feed regulasi otomatis dari OJK (POJK, SEOJK).',
                'category'     => 'reporting',
                'status'       => 'available',
                'last_sync_at' => null,
                'next_sync_at' => null,
                'endpoint_url' => 'https://feed.ojk.go.id/v1',
                'webhook_url'  => null,
                'health_score' => 0,
                'is_critical'  => false,
                'flows_json'   => [],
                'config_json'  => null,
            ],
        ];

        foreach ($rows as $r) {
            Integration::updateOrCreate(['slug' => $r['slug']], $r);
        }
    }
}
