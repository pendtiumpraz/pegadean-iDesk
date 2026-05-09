import { Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { ArrowLeft } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import Donut from '@/Components/Donut'
import HBar from '@/Components/HBar'
import RightRail from '@/Components/RightRail'
import AISuggestionCallout from '@/Components/AISuggestionCallout'

const SEVERITY_LABEL = {
    low: 'Rendah', medium: 'Medium', high: 'Tinggi', critical: 'Kritis',
}
const SEVERITY_TONE = {
    low: 'low', medium: 'med', high: 'high', critical: 'high',
}

const STATUS_LABEL = {
    open: 'Open', reviewed: 'Reviewed', resolved: 'Resolved', escalated: 'Escalated',
}
const STATUS_TONE = {
    open: 'draft', reviewed: 'review', resolved: 'approve', escalated: 'rejected',
}

function fmtDate(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function scoreFromSeverity(sev, score) {
    if (score != null) return score
    if (sev === 'critical') return 95
    if (sev === 'high')     return 82
    if (sev === 'medium')   return 65
    return 40
}

function scoreColor(score) {
    if (score >= 80) return 'var(--rose-600)'
    if (score >= 60) return 'var(--amber-600)'
    return 'var(--brand-500)'
}

export default function AmlAlertsShow({ alert }) {
    const score = scoreFromSeverity(alert?.severity, alert?.score)

    /* Factor rows (props or fallback) */
    const factors = alert?.factors ?? [
        { label: 'Velocity transaksi 24 jam',  weight: 28 },
        { label: 'Selisih dengan profil rata-rata', weight: 22 },
        { label: 'Counterparty risk',          weight: 18 },
        { label: 'Pola structuring',           weight: 14 },
        { label: 'Lokasi geografis berisiko',  weight: 10 },
        { label: 'Lainnya',                    weight: 8  },
    ]

    /* Transaction trail (props or fallback) */
    const trail = alert?.transactions ?? []

    /* Watchlist hits (props or fallback) */
    const watchlistHits = alert?.watchlist_hits ?? []

    return (
        <AppLayout title={`AML Alert — ${alert?.title ?? ''}`}>
            <PageHeader
                title={alert?.title ?? 'Detail AML Alert'}
                description="Suspicious activity alert dari sistem PERISAI"
                breadcrumbs={[
                    { label: 'AML Alerts', href: route('aml-alerts.index') },
                    { label: alert?.title ?? 'Detail' },
                ]}
                actions={
                    <Link href={route('aml-alerts.index')} className="btn ghost">
                        <ArrowLeft size={14} /> Kembali
                    </Link>
                }
            />

            <AISuggestionCallout
                title="Data read-only dari sistem AML/CFT"
                body="Tindakan investigasi (eskalasi, tutup, EDD) dilakukan dari aplikasi PERISAI. Portal ini hanya menampilkan informasi alert."
                style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={SEVERITY_TONE[alert?.severity] ?? 'low'} label={`Severity: ${SEVERITY_LABEL[alert?.severity] ?? alert?.severity}`} />
                <Badge status={STATUS_TONE[alert?.status] ?? 'draft'}    label={STATUS_LABEL[alert?.status] ?? alert?.status} />
            </div>

            <RightRail
                main={
                    <>
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Skor &amp; Faktor Kontribusi</h3>
                                    <div className="sub">Ringkasan model</div>
                                </div>
                            </div>
                            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24 }}>
                                <Donut
                                    size={140}
                                    thickness={14}
                                    value={score}
                                    color={scoreColor(score)}
                                    centerValue={score}
                                    centerSub="dari 100"
                                />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {factors.map((f, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                                <span style={{ fontWeight: 500 }}>{f.label}</span>
                                                <span style={{ color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace' }}>{f.weight}%</span>
                                            </div>
                                            <HBar value={f.weight} max={Math.max(...factors.map(x => x.weight), 1)} height={5} color={f.weight >= 20 ? 'var(--rose-600)' : f.weight >= 12 ? 'var(--amber-600)' : 'var(--brand-500)'} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Detail Alert</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <h2 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 20, fontWeight: 500, lineHeight: 1.3, margin: '0 0 12px' }}>
                                    {alert?.title ?? '—'}
                                </h2>
                                {alert?.description && (
                                    <p style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 14, lineHeight: 1.7, color: 'var(--ink-700)', margin: 0 }}>
                                        {alert.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {trail.length > 0 && (
                            <div className="card">
                                <div className="card-head">
                                    <div>
                                        <h3>Jejak Transaksi</h3>
                                        <div className="sub">{trail.length} transaksi terkait</div>
                                    </div>
                                </div>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Waktu</th>
                                            <th>ID Transaksi</th>
                                            <th>Tipe</th>
                                            <th>Nominal</th>
                                            <th>Counterparty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trail.map((t, i) => (
                                            <tr key={i}>
                                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--ink-500)' }}>{fmtDate(t.at)}</td>
                                                <td><span className="doc-id">{t.id}</span></td>
                                                <td>{t.type ?? '—'}</td>
                                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{t.amount ?? '—'}</td>
                                                <td>{t.counterparty ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                }
                rail={
                    <>
                        <div className="card">
                            <div className="card-head">
                                <div>
                                    <h3>Nasabah</h3>
                                    <div className="sub">Tertaut ke profil AML</div>
                                </div>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                                {[
                                    ['ID Alert',  <span className="doc-id">{alert?.id ?? '—'}</span>],
                                    ['Nasabah ID', <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{alert?.nasabah_id ?? '—'}</span>],
                                    ['Severity', <Badge status={SEVERITY_TONE[alert?.severity] ?? 'low'} label={SEVERITY_LABEL[alert?.severity] ?? alert?.severity} />],
                                    ['Status',   <Badge status={STATUS_TONE[alert?.status] ?? 'draft'} label={STATUS_LABEL[alert?.status] ?? alert?.status} />],
                                    ['Skor',     <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: scoreColor(score) }}>{score}/100</span>],
                                    ['Dibuat',   fmtDate(alert?.created_at)],
                                ].map(([k, v], i, arr) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: i < arr.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                                        <span style={{ color: 'var(--ink-500)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{k}</span>
                                        <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {watchlistHits.length > 0 && (
                            <div className="card">
                                <div className="card-head">
                                    <div>
                                        <h3>Watchlist Hits</h3>
                                        <div className="sub">{watchlistHits.length} kecocokan</div>
                                    </div>
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {watchlistHits.map((h, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < watchlistHits.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose-600)', flex: 'none' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: 12.5 }}>{h.source}</div>
                                                <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{h.match}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    )
}
