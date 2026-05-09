<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AuditTrailSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            ['Rizky Hartono',         'user',   'viewed',    'Serkep',           'SK-2026/0431', 'Membuka SERKEP SK-2026/0431 untuk tinjauan'],
            ['Sekar Pratiwi',         'user',   'submitted', 'Disposisi',        'SK-2026/0427', 'Mendisposisi naskah ke KaDep CPP'],
            ['Auto · AI Co-pilot',    'system', 'created',   'AiReview',         'SK-2026/0431', 'Menjalankan analisa otomatis (5 temuan)'],
            ['Anita Yusuf',           'user',   'approved',  'ReviewTask',       'SK-2026/0429', 'Menyelesaikan kajian'],
            ['Auto · PERISAI',        'system', 'created',   'AmlAlert',         'TRX-26050700438', 'Mengirim alert dengan skor 81'],
            ['M. Krisna',             'user',   'updated',   'Serkep',           'SK-2026/0429', 'Mengunggah versi v3'],
            ['Dewi Anggraini',        'user',   'updated',   'SystemSetting',    'notif.email_enabled', 'Mengubah preferensi notifikasi email'],
            ['Auto · POJK Feed',      'system', 'created',   'Policy',           'POJK-18/2024', 'Menyinkronkan 3 regulasi baru'],
            ['Rizky Hartono',         'user',   'approved',  'Policy',           'KIMRK-4.2', 'Menyetujui revisi pasal 7'],
            ['Sekar Pratiwi',         'user',   'submitted', 'StrReport',        'STR-2026-00187', 'Mengajukan STR ke PPATK'],
            ['Bagas Pratama',         'user',   'created',   'ComplianceRisk',   'RCS-OPS-014', 'Membuat entri risiko baru'],
            ['Anita Yusuf',           'user',   'rejected',  'AiFinding',        'AIF-2026-0091', 'Menolak temuan AI (false positive)'],
            ['Dewi Anggraini',        'user',   'exported',  'Monitoring',       'KPMR-Q1-2026', 'Mengekspor laporan KPMR Q1 2026'],
            ['M. Krisna',             'user',   'created',   'Commitment',       'KMT-2026/041', 'Membuat komitmen mitigasi baru'],
            ['Auto · BeComply',       'system', 'updated',   'Integration',      'becomply', 'Sinkronisasi otomatis berhasil'],
            ['Rizky Hartono',         'user',   'viewed',    'Disposisi',        'SK-2026/0427', 'Membuka detail disposisi'],
            ['Sekar Pratiwi',         'user',   'approved',  'Serkep',           'SK-2026/0428', 'Mengesahkan SERKEP'],
            ['Auto · APASI',          'system', 'created',   'Notification',     'NOTIF-3142', 'Notifikasi gratifikasi baru diterima'],
            ['Anita Yusuf',           'user',   'updated',   'ReviewTask',       'TR-2026/0218', 'Memperbarui status kajian'],
            ['Bagas Pratama',         'user',   'deleted',   'ComplianceRisk',   'RCS-OPS-009', 'Menghapus risiko duplikat'],
            ['Auto · PERISAI',        'system', 'created',   'AmlAlert',         'TRX-26050700412', 'Alert otomatis (skor 76)'],
            ['M. Krisna',             'user',   'updated',   'Policy',           'KIMRK-4.2', 'Memperbarui metadata kebijakan'],
            ['Rizky Hartono',         'user',   'submitted', 'StrReport',        'STR-2026-00188', 'Submit draft STR'],
            ['Dewi Anggraini',        'user',   'approved',  'AiReview',         'AIR-2026-0312', 'Mengonfirmasi temuan AI sebagai valid'],
            ['Sekar Pratiwi',         'user',   'created',   'Disposisi',        'SK-2026/0432', 'Membuat disposisi baru ke Anti Fraud'],
            ['Auto · OJK Feed',       'system', 'created',   'Policy',           'SEOJK-04/2026', 'Sinkron regulasi OJK terbaru'],
            ['Anita Yusuf',           'user',   'viewed',    'AmlAlert',         'TRX-26050700438', 'Membuka detail alert'],
            ['Bagas Pratama',         'user',   'updated',   'Commitment',       'KMT-2026/038', 'Mengubah due-date komitmen'],
            ['M. Krisna',             'user',   'exported',  'Serkep',           'Q1-2026', 'Mengekspor daftar SERKEP Q1'],
            ['Dewi Anggraini',        'user',   'updated',   'SystemSetting',    'ai.auto_review', 'Mengaktifkan AI auto-review'],
        ];

        $now = Carbon::now();
        foreach ($events as $i => $e) {
            AuditLog::create([
                'actor_id'      => null,
                'actor_type'    => $e[1],
                'actor_name'    => $e[0],
                'action'        => $e[2],
                'entity_type'   => $e[3],
                'entity_id'     => $e[4],
                'entity_name'   => $e[4],
                'description'   => $e[5],
                'ip_address'    => '10.10.0.' . (10 + $i),
                'user_agent'    => 'Mozilla/5.0 iDesk/2.0',
                'metadata_json' => null,
                'created_at'    => $now->copy()->subMinutes($i * 17),
            ]);
        }
    }
}
