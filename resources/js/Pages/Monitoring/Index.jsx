import { useMemo } from 'react'
import { router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    BarChart3, Download, RefreshCw, Activity, ShieldAlert, FileBarChart,
    Sparkles, Inbox as InboxIcon, CheckCircle2, FileText, AlertTriangle,
    BookOpen, Send,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import HBar from '@/Components/HBar'
import Donut from '@/Components/Donut'
import Tag from '@/Components/Tag'
import Avatar from '@/Components/Avatar'
import InboxItem from '@/Components/InboxItem'

/* ── tone helpers ── */
const TONE_COLOR = {
    brand: 'var(--brand-500)',
    info:  'var(--info-600)',
    rose:  'var(--rose-600)',
    amber: 'var(--amber-600)',
    gold:  'var(--gold-500)',
    ink:   'var(--ink-300)',
}

const SCORE_TONE = {
    high: { label: 'Tinggi', tone: 'rose'  },
    med:  { label: 'Sedang', tone: 'amber' },
    low:  { label: 'Rendah', tone: 'brand' },
}

/* ── line+area chart ── */
function SuspiciousChart({ data = [], height = 240 }) {
    const width = 720
    const padX = 28, padTop = 24, padBot = 36

    const totals      = data.map(d => d.total)
    const suspicious  = data.map(d => d.suspicious)
    const allMax      = Math.max(1, ...totals)

    const stepX = (width - padX * 2) / Math.max(1, data.length - 1)
    const innerH = height - padTop - padBot
    const toY = (v) => padTop + innerH - (v / allMax) * innerH

    const buildPath = (arr) =>
        arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${padX + i * stepX},${toY(v)}`).join(' ')

    const buildArea = (arr) => {
        const top = arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${padX + i * stepX},${toY(v)}`).join(' ')
        const lastX = padX + (arr.length - 1) * stepX
        return `${top} L${lastX},${padTop + innerH} L${padX},${padTop + innerH} Z`
    }

    // x-axis labels (every ~7 days)
    const labelEvery = Math.max(1, Math.floor(data.length / 5))

    // y-grid
    const grids = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(allMax * p))

    return (
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label="Suspicious transactions trend">
            {/* grid */}
            {grids.map((g, i) => {
                const y = toY(g)
                return (
                    <g key={i}>
                        <line x1={padX} x2={width - padX} y1={y} y2={y}
                              stroke="var(--ink-100)" strokeDasharray="3 3" />
                        <text x={padX - 6} y={y + 3} fontSize="10" fill="var(--ink-500)" textAnchor="end">{g}</text>
                    </g>
                )
            })}

            {/* total area + line */}
            <path d={buildArea(totals)}     fill="var(--brand-500)"  opacity="0.10" />
            <path d={buildPath(totals)}     fill="none" stroke="var(--brand-600)" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />

            {/* suspicious area + line */}
            <path d={buildArea(suspicious)} fill="var(--rose-600)"   opacity="0.10" />
            <path d={buildPath(suspicious)} fill="none" stroke="var(--rose-600)"  strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />

            {/* dots on suspicious */}
            {suspicious.map((v, i) => (
                <circle key={i} cx={padX + i * stepX} cy={toY(v)} r="2.2" fill="var(--rose-600)" />
            ))}

            {/* x-axis labels */}
            {data.map((d, i) => (i % labelEvery === 0 || i === data.length - 1) && (
                <text key={i} x={padX + i * stepX} y={height - 14} fontSize="10"
                      fill="var(--ink-500)" textAnchor="middle">{d.label}</text>
            ))}
        </svg>
    )
}

export default function MonitoringIndex({
    kpis = {},
    suspicious_tx_30d = [],
    top_risks = [],
    compliance_index = [],
    action_plan = [],
    recent_disposisi = [],
    today_activity = [],
}) {
    const totalSusp = useMemo(
        () => suspicious_tx_30d.reduce((a, b) => a + (b.suspicious ?? 0), 0),
        [suspicious_tx_30d],
    )
    const totalTx = useMemo(
        () => suspicious_tx_30d.reduce((a, b) => a + (b.total ?? 0), 0),
        [suspicious_tx_30d],
    )

    function handleExportKpmr() {
        window.location.href = route('monitoring.export-kpmr')
    }

    function handleRefresh() {
        router.reload({ only: ['kpis', 'suspicious_tx_30d', 'top_risks', 'today_activity'] })
    }

    const actionPlanSegments = action_plan.map(s => ({
        value: s.value,
        color: s.color,
        label: s.label,
    }))

    return (
        <AppLayout title="Monitoring & Analytics">
            <PageHeader
                title={<span className="display">Monitoring &amp; Analytics</span>}
                description="Pemantauan risiko kepatuhan, gratifikasi, dan APU PPT secara realtime."
                breadcrumbs={[{ label: 'Monitoring' }, { label: 'Compliance Risk' }]}
                actions={
                    <>
                        <button type="button" className="btn ghost" onClick={handleRefresh}>
                            <RefreshCw size={14} /> Segarkan
                        </button>
                        <button type="button" className="btn primary" onClick={handleExportKpmr}>
                            <Download size={14} /> Ekspor KPMR
                        </button>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="kpi-grid">
                <StatCard
                    label="Total Transaksi 30 Hari"
                    value={(kpis.total_tx_30d ?? totalTx).toLocaleString('id-ID')}
                    tone="brand"
                    icon={Activity}
                    delta="▲ 8.4%"
                    deltaTone="up"
                    deltaLabel="vs 30 hari sebelumnya"
                />
                <StatCard
                    label="Suspicious Detected"
                    value={(kpis.suspicious_30d ?? totalSusp).toLocaleString('id-ID')}
                    unit="alert"
                    tone="rose"
                    icon={ShieldAlert}
                    delta="▲ 12"
                    deltaTone="up"
                    deltaLabel="butuh tindak lanjut"
                />
                <StatCard
                    label="Pending STR"
                    value={kpis.pending_str ?? 12}
                    unit="draft"
                    tone="amber"
                    icon={FileBarChart}
                    deltaLabel="diajukan ke PPATK"
                />
                <StatCard
                    label="Risk Score Aggregate"
                    value={kpis.risk_score_avg ?? 2.4}
                    unit="/ 5"
                    tone="info"
                    icon={Sparkles}
                    delta="▼ 0.3"
                    deltaTone="up"
                    deltaLabel="sejak Q4"
                />
            </div>

            {/* Two-col chart + top-risk */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginTop: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Suspicious Transactions 30 Hari</h3>
                            <div className="sub">Total transaksi vs alert mencurigakan · sumber PERISAI</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: 'var(--ink-500)' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 8, height: 8, background: 'var(--brand-600)', borderRadius: 2 }} /> Total
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 8, height: 8, background: 'var(--rose-600)', borderRadius: 2 }} /> Suspicious
                            </span>
                        </div>
                    </div>
                    <div className="card-body">
                        <SuspiciousChart data={suspicious_tx_30d} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Top Risk by Score</h3>
                            <div className="sub">5 risiko aktif teratas</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama</th>
                                    <th>Skor</th>
                                    <th>PIC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_risks.map((r) => {
                                    const s = SCORE_TONE[r.tone] ?? SCORE_TONE.low
                                    return (
                                        <tr key={r.code}>
                                            <td><span className="doc-id">{r.code}</span></td>
                                            <td style={{ fontWeight: 500, maxWidth: 200, fontSize: 12.5 }}>{r.name}</td>
                                            <td><Tag tone={s.tone} size="sm">{r.score}</Tag></td>
                                            <td>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                    <Avatar name={r.pic} size={22} tone="brand" />
                                                    <span style={{ fontSize: 12 }}>{r.pic.split(' ')[0]}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Three-col: compliance index / action plan / disposisi */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Compliance Index per Divisi</h3>
                            <div className="sub">Skor pemenuhan kepatuhan</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {compliance_index.map((d) => {
                            const color =
                                d.value >= 90 ? 'var(--brand-500)' :
                                d.value >= 80 ? 'var(--info-600)'  :
                                d.value >= 70 ? 'var(--amber-600)' : 'var(--rose-600)'
                            return (
                                <HBar
                                    key={d.division}
                                    label={d.division}
                                    value={d.value}
                                    max={100}
                                    color={color}
                                    valueLabel={`${d.value}%`}
                                />
                            )
                        })}
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Action Plan Status</h3>
                            <div className="sub">Status komitmen mitigasi</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Donut
                            segments={actionPlanSegments}
                            size={140}
                            thickness={16}
                            centerLabel="TOTAL"
                            centerValue={action_plan.reduce((a, s) => a + s.value, 0)}
                            centerSub="action plan"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                            {action_plan.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                                    <span style={{ width: 10, height: 10, background: s.color, borderRadius: 2 }} />
                                    <span style={{ flex: 1 }}>{s.label}</span>
                                    <span style={{ fontWeight: 600 }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Recent Disposisi</h3>
                            <div className="sub">5 disposisi terbaru</div>
                        </div>
                        <InboxIcon size={16} style={{ color: 'var(--ink-500)' }} />
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <div className="inbox">
                            {recent_disposisi.map((d, i) => (
                                <div key={i} className="inbox-item">
                                    <InboxItem
                                        from={d.from}
                                        time={d.time}
                                        title={d.title}
                                        preview={d.preview}
                                        unread={d.unread}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Today timeline */}
            <div className="card" style={{ marginTop: 16 }}>
                <div className="card-head">
                    <div>
                        <h3>Aktivitas Hari Ini</h3>
                        <div className="sub">Linimasa kejadian terkini · sumber audit log</div>
                    </div>
                </div>
                <div className="card-body">
                    <div style={{ position: 'relative', paddingLeft: 24 }}>
                        <span style={{
                            position: 'absolute', left: 8, top: 4, bottom: 4,
                            width: 1, background: 'var(--ink-200)',
                        }} />
                        {today_activity.map((a, i) => {
                            const Icon =
                                a.tone === 'info' ? Sparkles :
                                a.tone === 'rose' ? AlertTriangle :
                                CheckCircle2
                            const color = TONE_COLOR[a.tone] ?? TONE_COLOR.brand
                            return (
                                <div key={i} style={{
                                    position: 'relative',
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    padding: '10px 0',
                                }}>
                                    <span style={{
                                        position: 'absolute', left: -22,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: 'var(--paper)', border: `2px solid ${color}`,
                                        display: 'grid', placeItems: 'center',
                                    }}>
                                        <Icon size={10} style={{ color }} />
                                    </span>
                                    <span style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: 11.5, color: 'var(--ink-500)',
                                        minWidth: 50,
                                    }}>{a.time}</span>
                                    <Avatar name={a.actor} size={22} tone={a.tone === 'info' ? 'info' : a.tone === 'rose' ? 'rose' : 'brand'} />
                                    <span style={{ fontWeight: 600, fontSize: 13, minWidth: 160 }}>{a.actor}</span>
                                    <span style={{ color: 'var(--ink-700)', fontSize: 13 }}>{a.action}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
