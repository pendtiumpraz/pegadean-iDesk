import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Badge from '@/Components/Badge'
import {
    FileText,
    Bot,
    Sparkles,
    AlertOctagon,
    Plus,
    Download,
    ChevronRight,
    Flag,
    CheckCircle,
} from 'lucide-react'

export default function DashboardIndex({
    auth,
    policies_active,
    serkep_pending,
    review_tasks_open,
    risks_high,
    queue_items,
    copilot_activity,
    disposisi_items,
}) {
    const userName = auth?.user?.name?.split(' ')?.[0] ?? 'Pengguna'

    /* ---- Antrian Tinjauan SERKEP ---- */
    const queue = Array.isArray(queue_items) && queue_items.length > 0
        ? queue_items
        : [
            { id: 'SK-2026/0431', title: 'Pedoman Pengelolaan Risiko Operasional Cabang', initiator: 'Div. Manajemen Risiko', stage: 'review', risk: 'high', sla: '2 hari' },
            { id: 'SK-2026/0429', title: 'Kebijakan Pemberian Kredit Mikro Emas',         initiator: 'Div. Bisnis Gadai',      stage: 'kajian', risk: 'med',  sla: '1 hari' },
            { id: 'SK-2026/0427', title: 'SE Penyesuaian Tarif Penyimpanan Emas',         initiator: 'Div. Treasury',          stage: 'approve', risk: 'low', sla: '5 hari' },
            { id: 'SK-2026/0425', title: 'SOP Penanganan Nasabah PEP',                    initiator: 'Div. Anti Fraud',        stage: 'review', risk: 'high', sla: 'SLA -1' },
            { id: 'SK-2026/0421', title: 'Pedoman Whistleblowing System',                 initiator: 'Div. SDM',                stage: 'draft',  risk: 'low',  sla: '7 hari' },
            { id: 'SK-2026/0418', title: 'Kebijakan Outsourcing Layanan TI',              initiator: 'Div. TI',                stage: 'released', risk: '—',  sla: 'selesai' },
        ]

    /* ---- AI Co-pilot activity ---- */
    const activity = Array.isArray(copilot_activity) && copilot_activity.length > 0
        ? copilot_activity
        : [
            { icon: 'sparkle', title: '8 draft dianalisa',     subtitle: 'Cross-check terhadap 247 kebijakan induk + 89 regulasi OJK', tone: 'brand' },
            { icon: 'flag',    title: '14 potensi konflik',    subtitle: 'Disorot di SK-2026/0431 (Pasal 7) — referensi POJK 18/2024',  tone: 'rose' },
            { icon: 'check',   title: '5 saran disetujui',     subtitle: 'KaDep menyetujui revisi pada SK-2026/0427',                     tone: 'brand' },
        ]

    /* ---- Disposisi anda ---- */
    const dispo = Array.isArray(disposisi_items) && disposisi_items.length > 0
        ? disposisi_items
        : [
            { title: 'Pengesahan SE Penyesuaian Tarif Penyimpanan Emas', meta: 'Dari: KaDiv Kepatuhan · 2 jam', status: 'review' },
            { title: 'Klarifikasi pasal 12 — SOP Penanganan PEP',         meta: 'Dari: Tim CPP · kemarin',       status: 'high' },
            { title: 'Penomoran SERKEP SK-2026/0418',                     meta: 'Dari: Sekretariat · 2 hari',    status: 'approve' },
        ]

    const stageLabel = {
        draft:    'Drafting',
        review:   'Review CPP',
        kajian:   'Kajian',
        approve:  'Pengesahan',
        released: 'Terbit',
    }
    const riskLabel = { high: 'Tinggi', med: 'Sedang', low: 'Rendah' }

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard · iDesk" />

            <PageHeader
                breadcrumbs={[{ label: 'Beranda' }, { label: 'Dashboard Kepatuhan' }]}
                title={`Selamat datang, ${userName}`}
                description={`${serkep_pending ?? 12} SERKEP menunggu tinjauan, beberapa di antaranya melewati SLA. AI Co-pilot telah memproses draft sejak kemarin.`}
                actions={
                    <>
                        <button type="button" className="btn ghost">
                            <Download size={14} /> Ekspor laporan
                        </button>
                        <Link href="/serkep/create" className="btn primary">
                            <Plus size={14} /> Pengajuan baru
                        </Link>
                    </>
                }
            />

            {/* KPI grid */}
            <div className="kpi-grid">
                <StatCard
                    label="SERKEP Aktif"
                    value={serkep_pending ?? 42}
                    unit="draft"
                    icon={FileText}
                    tone="brand"
                    delta="▲ 6"
                    deltaTone="up"
                    deltaLabel="dari pekan lalu"
                />
                <StatCard
                    label="Tugas Review Terbuka"
                    value={review_tasks_open ?? 18}
                    unit="tugas"
                    icon={Bot}
                    tone="gold"
                    delta="▼ 4"
                    deltaTone="up"
                    deltaLabel="lebih cepat"
                />
                <StatCard
                    label="Akurasi AI Review"
                    value="94.7"
                    unit="%"
                    icon={Sparkles}
                    tone="info"
                    delta="▲ 2.1pp"
                    deltaTone="up"
                    deltaLabel="vs Q1"
                />
                <StatCard
                    label="Temuan Risiko Tinggi"
                    value={risks_high ?? 5}
                    unit="item"
                    icon={AlertOctagon}
                    tone="rose"
                    delta="▲ 2"
                    deltaTone="down"
                    deltaLabel="butuh tindak lanjut"
                />
            </div>

            {/* Two-col: queue table + side cards */}
            <div className="two-col" style={{ marginTop: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Antrian Tinjauan SERKEP</h3>
                            <div className="sub">{queue.length} dokumen dalam alur kepatuhan</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button type="button" className="chip active">Semua</button>
                            <button type="button" className="chip">Drafting</button>
                            <button type="button" className="chip">Review</button>
                            <button type="button" className="chip">Pengesahan</button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>No. Pengajuan</th>
                                    <th>Judul Kebijakan</th>
                                    <th>Pemrakarsa</th>
                                    <th>Tahap</th>
                                    <th>Risiko</th>
                                    <th>SLA</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.map((r) => (
                                    <tr key={r.id}>
                                        <td><span className="doc-id">{r.id}</span></td>
                                        <td style={{ fontWeight: 600 }}>{r.title}</td>
                                        <td>{r.initiator}</td>
                                        <td>
                                            <Badge status={r.stage} label={stageLabel[r.stage] ?? r.stage} />
                                        </td>
                                        <td>
                                            {r.risk === '—' || !r.risk ? (
                                                <span style={{ color: 'var(--ink-400)' }}>—</span>
                                            ) : (
                                                <Badge status={r.risk} label={riskLabel[r.risk] ?? r.risk} />
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                color: String(r.sla).includes('-')
                                                    ? 'var(--rose-600)'
                                                    : 'var(--ink-700)',
                                                fontWeight: String(r.sla).includes('-') ? 600 : 500,
                                            }}
                                        >
                                            {r.sla}
                                        </td>
                                        <td>
                                            <Link href={`/serkep/${encodeURIComponent(r.id)}`} className="icon-btn">
                                                <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* AI Co-pilot card */}
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>AI Co-pilot · Hari Ini</h3>
                                <div className="sub">Aktivitas otomatis</div>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activity.map((a, i) => {
                                const IconC = a.icon === 'flag' ? Flag : a.icon === 'check' ? CheckCircle : Sparkles
                                const tone = a.tone === 'rose'
                                    ? { bg: 'var(--rose-100)', fg: 'var(--rose-600)' }
                                    : { bg: 'var(--brand-100)', fg: 'var(--brand-700)' }
                                return (
                                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div
                                            style={{
                                                width: 28, height: 28,
                                                borderRadius: 8,
                                                background: tone.bg,
                                                color: tone.fg,
                                                display: 'grid',
                                                placeItems: 'center',
                                                flex: 'none',
                                            }}
                                        >
                                            <IconC size={14} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
                                                {a.subtitle}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <Link href="/ai-review" className="btn subtle" style={{ width: 'fit-content' }}>
                                <Sparkles size={14} /> Buka Co-pilot
                            </Link>
                        </div>
                    </div>

                    {/* Disposisi card */}
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Disposisi Anda</h3>
                                <div className="sub">{dispo.length} menunggu tindakan</div>
                            </div>
                            <Link href="/disposisi" className="btn ghost sm">
                                Buka inbox
                            </Link>
                        </div>
                        <div className="card-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
                            {dispo.map((d, i) => (
                                <div key={i} className="list-row">
                                    <div>
                                        <div className="title">{d.title}</div>
                                        <div className="meta">{d.meta}</div>
                                    </div>
                                    <Badge status={d.status} label={
                                        d.status === 'review'  ? 'Review'
                                      : d.status === 'high'    ? 'Urgen'
                                      : d.status === 'approve' ? 'Pengesahan'
                                      : d.status
                                    } />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Three-col secondary cards */}
            <div className="three-col" style={{ marginTop: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Volume Tinjauan SERKEP</h3>
                            <div className="sub">Trimester berjalan</div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--ink-500)' }}>
                            <span>
                                <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--brand-600)', borderRadius: 2, marginRight: 6 }} />
                                Selesai
                            </span>
                            <span>
                                <span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--gold-500)', borderRadius: 2, marginRight: 6 }} />
                                Aktif
                            </span>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="bar-chart">
                            {[
                                [12, 4], [14, 3], [18, 5], [16, 7], [22, 6], [19, 8],
                                [24, 5], [28, 9], [31, 7], [27, 11], [33, 8], [36, 12],
                            ].map((p, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div className="bar alt" data-v={`${p[1]} aktif`} style={{ height: `${p[1] * 4}px` }} />
                                    <div className="bar q2" data-v={`${p[0]} selesai`} style={{ height: `${p[0] * 3}px` }} />
                                </div>
                            ))}
                        </div>
                        <div className="bar-axis">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
                            <span>Mei</span><span>Jun</span><span>Jul</span><span>Agu</span>
                            <span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Kebijakan Aktif</h3>
                            <div className="sub">Repository terindeks</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="donut" style={{ '--p': 78, '--c': 'var(--brand-600)' }}>
                            <div className="num">{policies_active ?? 247}<small></small></div>
                        </div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
                            <div><b>{policies_active ?? 247}</b> kebijakan aktif</div>
                            <div style={{ color: 'var(--ink-500)' }}>89 regulasi eksternal terhubung</div>
                            <div style={{ marginTop: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, background: 'var(--brand-600)', borderRadius: 2 }} /> Induk
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, background: 'var(--gold-500)', borderRadius: 2 }} /> Anak
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, background: 'var(--info-600)', borderRadius: 2 }} /> Eksternal
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Aktivitas APU PPT</h3>
                            <div className="sub">12 minggu terakhir</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="heatmap">
                            {Array.from({ length: 84 }).map((_, i) => {
                                const r = Math.floor((Math.sin(i * 1.7) + 1) * 2.5)
                                const cls = r === 0 ? '' : `l${Math.min(r, 4)}`
                                return <div key={i} className={`cell ${cls}`} />
                            })}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 10,
                                fontSize: 11.5,
                                color: 'var(--ink-500)',
                            }}
                        >
                            <span>12 minggu</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                Rendah
                                <span style={{ width: 10, height: 10, background: 'var(--ink-100)', borderRadius: 2 }} />
                                <span style={{ width: 10, height: 10, background: 'var(--brand-100)', borderRadius: 2 }} />
                                <span style={{ width: 10, height: 10, background: 'oklch(0.78 0.06 155)', borderRadius: 2 }} />
                                <span style={{ width: 10, height: 10, background: 'var(--brand-500)', borderRadius: 2 }} />
                                <span style={{ width: 10, height: 10, background: 'var(--brand-600)', borderRadius: 2 }} />
                                Tinggi
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
