<?php

namespace App\Http\Controllers;

use App\Models\AmlAlert;
use App\Models\ComplianceRisk;
use App\Models\Disposisi;
use App\Models\StrReport;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index()
    {
        // Suspicious tx series — last 30 days (mock blended with live counts when possible)
        $base = [3,5,4,7,6,8,5,9,7,11,8,6,9,12,10,8,7,11,9,13,10,8,12,9,7,11,8,10,12,14];
        $totalBase = [42,55,48,61,52,68,58,71,63,82,67,59,72,88,79,66,61,84,69,93,76,64,87,72,58,81,67,77,89,98];

        $suspiciousSeries = [];
        $startDate = Carbon::now()->subDays(29);
        for ($i = 0; $i < 30; $i++) {
            $d = $startDate->copy()->addDays($i);
            $suspiciousSeries[] = [
                'date'        => $d->format('Y-m-d'),
                'label'       => $d->format('d M'),
                'total'       => $totalBase[$i],
                'suspicious'  => $base[$i],
            ];
        }

        $topRisks = [
            ['code' => 'RCS-OPS-014', 'name' => 'Pendelegasian limit kredit cabang melampaui kewenangan', 'score' => 16, 'pic' => 'Rizky Hartono', 'tone' => 'high'],
            ['code' => 'RCS-AML-008', 'name' => 'Keterlambatan pelaporan STR ke PPATK',                    'score' => 12, 'pic' => 'Sekar Pratiwi', 'tone' => 'med'],
            ['code' => 'RCS-GCG-003', 'name' => 'Konflik kepentingan penerimaan gratifikasi',              'score' => 9,  'pic' => 'Anita Yusuf',   'tone' => 'med'],
            ['code' => 'RCS-IT-021',  'name' => 'Vendor TI tanpa kontrak diperbaharui',                    'score' => 8,  'pic' => 'M. Krisna',     'tone' => 'low'],
            ['code' => 'RCS-OPS-019', 'name' => 'Selisih kas cabang > Rp 5 juta tanpa rekonsiliasi',       'score' => 6,  'pic' => 'Bagas Pratama', 'tone' => 'low'],
        ];

        $complianceIndex = [
            ['division' => 'Manajemen Risiko', 'value' => 96],
            ['division' => 'Anti Fraud',       'value' => 92],
            ['division' => 'Operasional',      'value' => 88],
            ['division' => 'TI',               'value' => 81],
            ['division' => 'SDM',              'value' => 78],
        ];

        $actionPlan = [
            ['label' => 'Open',         'value' => 18, 'color' => 'var(--ink-300)'],
            ['label' => 'In Progress',  'value' => 26, 'color' => 'var(--info-600)'],
            ['label' => 'Completed',    'value' => 41, 'color' => 'var(--brand-500)'],
            ['label' => 'Overdue',      'value' => 7,  'color' => 'var(--rose-600)'],
        ];

        $recentDisposisi = [
            ['from' => 'Sekar Pratiwi · KaDiv',     'time' => '10:08', 'title' => 'SK-2026/0427 → KaDep CPP',      'preview' => 'Mohon ditelaah revisi pasal 7 sebelum Senin.', 'unread' => true],
            ['from' => 'Anita Yusuf · Reviewer',    'time' => '09:42', 'title' => 'SK-2026/0429 selesai dikaji',    'preview' => 'Tidak ditemukan ketidaksesuaian material.',  'unread' => false],
            ['from' => 'Auto · PERISAI',            'time' => '08:55', 'title' => 'TRX-26050700438 (skor 81)',      'preview' => 'Alert otomatis dibuat dari pipeline AML.',     'unread' => true],
            ['from' => 'M. Krisna · Pemrakarsa',    'time' => '08:30', 'title' => 'SK-2026/0429 v3 diunggah',       'preview' => 'Versi terbaru tersedia untuk reviewer.',      'unread' => false],
            ['from' => 'Auto · POJK Feed',          'time' => '07:48', 'title' => '3 regulasi baru tersinkron',     'preview' => 'POJK 18/2024, SEOJK 04/2026, KIMRK-4.3.',     'unread' => false],
        ];

        $todayActivity = [
            ['time' => '10:24', 'actor' => 'Rizky Hartono',     'action' => 'membuka SK-2026/0431',                'tone' => 'brand'],
            ['time' => '10:08', 'actor' => 'Sekar Pratiwi',     'action' => 'mendisposisi SK-2026/0427 → KaDep',    'tone' => 'brand'],
            ['time' => '09:42', 'actor' => 'Auto · AI Co-pilot','action' => 'menjalankan analisa pada SK-2026/0431','tone' => 'info'],
            ['time' => '09:18', 'actor' => 'Anita Yusuf',       'action' => 'menyelesaikan kajian SK-2026/0429',    'tone' => 'brand'],
            ['time' => '08:55', 'actor' => 'Auto · PERISAI',    'action' => 'mengirim alert TRX-26050700438',       'tone' => 'rose'],
            ['time' => '08:30', 'actor' => 'M. Krisna',         'action' => 'mengunggah SK-2026/0429 v3',           'tone' => 'brand'],
            ['time' => '08:15', 'actor' => 'Dewi Anggraini',    'action' => 'mengubah pengaturan notifikasi',       'tone' => 'brand'],
            ['time' => '07:48', 'actor' => 'Auto · POJK Feed',  'action' => 'sinkron 3 regulasi baru',              'tone' => 'info'],
        ];

        return Inertia::render('Monitoring/Index', [
            'kpis' => [
                'total_tx_30d'        => array_sum($totalBase),
                'suspicious_30d'      => array_sum($base),
                'pending_str'         => $this->safeCount(StrReport::class, ['status' => 'draft'], 12),
                'risk_score_avg'      => 2.4,
            ],
            'suspicious_tx_30d' => $suspiciousSeries,
            'top_risks'         => $topRisks,
            'compliance_index'  => $complianceIndex,
            'action_plan'       => $actionPlan,
            'recent_disposisi'  => $recentDisposisi,
            'today_activity'    => $todayActivity,
        ]);
    }

    public function exportKpmr()
    {
        $rows = [
            ['Periode', 'Divisi', 'Skor Compliance', 'Open Risk', 'Mitigasi', 'Status'],
            ['Q1 2026', 'Manajemen Risiko', '96', '4', '6', 'On-track'],
            ['Q1 2026', 'Anti Fraud',       '92', '6', '5', 'On-track'],
            ['Q1 2026', 'Operasional',      '88', '9', '7', 'Watch'],
            ['Q1 2026', 'TI',               '81', '7', '4', 'Watch'],
            ['Q1 2026', 'SDM',              '78', '5', '3', 'Behind'],
        ];

        $filename = 'KPMR_Q1_2026_' . now()->format('Ymd_His') . '.csv';

        return Response::stream(function () use ($rows) {
            $out = fopen('php://output', 'w');
            foreach ($rows as $r) {
                fputcsv($out, $r);
            }
            fclose($out);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    private function safeCount(string $modelClass, array $where, int $fallback): int
    {
        try {
            return $modelClass::where($where)->count();
        } catch (\Throwable $e) {
            return $fallback;
        }
    }
}
