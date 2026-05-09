import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Eye, Bell, Send, User, Sparkles, Search, ShieldCheck,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Sparkline from '@/Components/Sparkline'
import Badge from '@/Components/Badge'
import HBar from '@/Components/HBar'
import ChipFilter from '@/Components/ChipFilter'
import DataTable from '@/Components/DataTable'
import AISuggestionCallout from '@/Components/AISuggestionCallout'

const SEVERITY_LABEL = {
    low:      'Rendah',
    medium:   'Medium',
    high:     'Tinggi',
    critical: 'Kritis',
}
const SEVERITY_TONE = {
    low: 'low', medium: 'med', high: 'high', critical: 'high',
}

const STATUS_LABEL = {
    open:      'Open',
    reviewed:  'Reviewed',
    resolved:  'Resolved',
    escalated: 'Escalated',
}
const STATUS_TONE = {
    open: 'draft', reviewed: 'review', resolved: 'approve', escalated: 'rejected',
}

function fmtDate(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function severityBarColor(sev) {
    if (sev === 'critical' || sev === 'high') return 'var(--rose-600)'
    if (sev === 'medium') return 'var(--amber-600)'
    return 'var(--brand-500)'
}

function scoreFromSeverity(sev, score) {
    if (score != null) return score
    if (sev === 'critical') return 95
    if (sev === 'high')     return 82
    if (sev === 'medium')   return 65
    return 40
}

export default function AmlAlertsIndex({ alerts, filters, stats }) {
    const { data = [], links = [], meta = {} } = alerts ?? {}
    const [activeChip, setActiveChip] = useState(filters?.severity ?? '')
    const [search, setSearch] = useState(filters?.search ?? '')

    const counts = useMemo(() => ({
        all:    data.length,
        high:   data.filter(r => r.severity === 'high' || r.severity === 'critical').length,
        med:    data.filter(r => r.severity === 'medium').length,
        low:    data.filter(r => r.severity === 'low').length,
        edd:    data.filter(r => r.status === 'reviewed').length,
        str:    data.filter(r => r.status === 'escalated').length,
    }), [data])

    const alertSpark = stats?.alert_spark ?? [80, 85, 90, 95, 100, 110, 118]
    const strSpark   = stats?.str_spark   ?? [20, 22, 25, 28, 32, 35, 38]
    const pep        = stats?.pep        ?? 347
    const accuracy   = stats?.accuracy   ?? 87

    /* Watchlist */
    const watchlist = stats?.watchlist ?? [
        { name: 'DTTOT (BNPT)',         entities: '3.421 entitas',  sync: 'Sinkron 12 menit lalu', tone: 'brand' },
        { name: 'DPSPM (PPATK)',        entities: '892 entitas',    sync: 'Sinkron 1 jam lalu',    tone: 'brand' },
        { name: 'UN Security Council',  entities: '12.480 entitas', sync: 'Sinkron 3 jam lalu',    tone: 'brand' },
        { name: 'OFAC SDN',             entities: '17.230 entitas', sync: 'Sinkron kemarin',       tone: 'amber' },
        { name: 'EU Sanctions List',    entities: '4.560 entitas',  sync: 'Sinkron 6 jam lalu',    tone: 'brand' },
    ]

    /* Tipologi */
    const tipologi = stats?.tipologi ?? [
        { label: 'Structuring (smurfing)', count: 47, color: 'var(--rose-600)'  },
        { label: 'Cash intensive',         count: 38, color: 'var(--amber-600)' },
        { label: 'High velocity transfer', count: 29, color: 'var(--gold-500)'  },
        { label: 'Round trip',             count: 22, color: 'var(--info-600)'  },
        { label: 'Layering',               count: 18, color: 'var(--brand-500)' },
        { label: 'Cross-border',           count: 12, color: 'var(--ink-500)'   },
    ]
    const maxTipologi = Math.max(...tipologi.map(t => t.count), 1)

    function applyFilter(overrides = {}) {
        router.get(route('aml-alerts.index'), {
            severity: overrides.severity !== undefined ? overrides.severity : activeChip,
            search:   overrides.search   !== undefined ? overrides.search   : search,
        }, { preserveState: true, replace: true })
    }

    const chips = [
        { value: '',         label: 'Semua',  count: counts.all },
        { value: 'high',     label: 'Tinggi', count: counts.high },
        { value: 'medium',   label: 'Medium', count: counts.med },
        { value: 'low',      label: 'Rendah', count: counts.low },
        { value: 'reviewed', label: 'EDD',    count: counts.edd },
        { value: 'escalated',label: 'STR',    count: counts.str },
    ]

    function onChipSelect(value) {
        setActiveChip(value)
        applyFilter({ severity: value })
    }

    const trailingSearch = (
        <div className="global-search" style={{ width: 240 }}>
            <span className="ic"><Search size={14} /></span>
            <input
                placeholder="Cari alert…"
                style={{ height: 32 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
            />
        </div>
    )

    const columns = [
        {
            key: 'title',
            header: 'Title',
            render: r => (
                <Link href={route('aml-alerts.show', r.id)} style={{ color: 'var(--ink-900)', fontWeight: 600, textDecoration: 'none' }}>
                    {r.title ?? '—'}
                </Link>
            ),
            style: { maxWidth: 280 },
        },
        {
            key: 'severity',
            header: 'Severity',
            render: r => {
                const score = scoreFromSeverity(r.severity, r.score)
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 130 }}>
                        <Badge status={SEVERITY_TONE[r.severity] ?? 'low'} label={SEVERITY_LABEL[r.severity] ?? r.severity} />
                        <HBar value={score} max={100} height={4} color={severityBarColor(r.severity)} style={{ width: 60 }} />
                    </div>
                )
            },
        },
        {
            key: 'nasabah_id',
            header: 'Nasabah',
            render: r => <span className="doc-id">{r.nasabah_id ?? '—'}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: r => <Badge status={STATUS_TONE[r.status] ?? 'draft'} label={STATUS_LABEL[r.status] ?? r.status} />,
        },
        {
            key: 'created_at',
            header: 'Dibuat',
            render: r => <span style={{ color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>{fmtDate(r.created_at)}</span>,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: r => (
                <Link href={route('aml-alerts.show', r.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Lihat">
                    <Eye size={14} />
                </Link>
            ),
        },
    ]

    return (
        <AppLayout title="AML Alerts">
            <PageHeader
                title="AML Alerts"
                description="Monitoring peringatan transaksi mencurigakan dari sistem AML/CFT (PERISAI)."
                breadcrumbs={[{ label: 'Monitoring' }, { label: 'AML Alerts' }]}
            />

            <AISuggestionCallout
                title="Data read-only dari sistem AML/CFT"
                body="Sinkronisasi otomatis setiap 15 menit dari PERISAI. Alert tidak dapat diubah dari portal ini — gunakan PERISAI untuk tindakan investigasi."
                style={{ marginBottom: 16 }}
            />

            <div className="kpi-grid">
                <StatCard
                    label="Alert Aktif"
                    value={counts.all}
                    unit="aktif"
                    icon={Bell}
                    tone="rose"
                    deltaLabel="7 hari terakhir"
                >
                    <Sparkline data={alertSpark} width={120} height={28} color="var(--rose-600)" style={{ marginTop: 8 }} />
                </StatCard>
                <StatCard
                    label="STR Diajukan"
                    value={counts.str}
                    unit="laporan"
                    icon={Send}
                    tone="gold"
                    deltaLabel="menunggu konfirmasi PPATK"
                >
                    <Sparkline data={strSpark} width={120} height={28} color="var(--gold-600)" style={{ marginTop: 8 }} />
                </StatCard>
                <StatCard
                    label="Nasabah PEP"
                    value={pep}
                    unit="nasabah"
                    icon={User}
                    tone="info"
                    deltaLabel="18 enhanced due diligence"
                />
                <StatCard
                    label="Akurasi Model"
                    value={accuracy}
                    unit="%"
                    icon={Sparkles}
                    tone="brand"
                    delta="▲ 4pp"
                    deltaTone="up"
                    deltaLabel="setelah retraining"
                />
            </div>

            <div className="two-col" style={{ marginTop: 16 }}>
                <DataTable
                    title="Alert Transaksi Mencurigakan"
                    subtitle={`${data.length} alert pada periode ini`}
                    columns={columns}
                    data={data}
                    getRowKey={r => r.id}
                    emptyMessage="Tidak ada alert."
                    filters={
                        <ChipFilter
                            chips={chips}
                            activeValue={activeChip}
                            onSelect={onChipSelect}
                            trailing={trailingSearch}
                        />
                    }
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Watchlist &amp; Sanksi</h3>
                                <div className="sub">Sumber resmi terhubung</div>
                            </div>
                            <ShieldCheck size={16} style={{ color: 'var(--brand-700)' }} />
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {watchlist.map((w, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0', borderBottom: i < watchlist.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: w.tone === 'brand' ? 'var(--brand-500)' : 'var(--amber-600)', flex: 'none' }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{w.name}</div>
                                        <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>
                                            {w.entities} · {w.sync}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Alert per Tipologi</h3>
                                <div className="sub">30 hari terakhir</div>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {tipologi.map((t, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 130, fontSize: 12 }}>{t.label}</span>
                                    <HBar value={t.count} max={maxTipologi} height={8} color={t.color} />
                                    <span style={{ fontWeight: 600, fontSize: 12, minWidth: 28, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{t.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {links.length > 0 && (
                <div style={{
                    marginTop: 12, padding: '0.75rem 1rem',
                    background: 'var(--paper)', border: '1px solid var(--ink-200)',
                    borderRadius: 12,
                    display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center',
                }}>
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveState
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            style={{
                                padding: '0.25rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.8rem',
                                border: '1px solid var(--ink-200)',
                                background: link.active ? 'var(--brand-600)' : 'var(--paper)',
                                color: link.active ? '#fff' : link.url ? 'var(--ink-900)' : 'var(--ink-400)',
                                pointerEvents: link.url ? 'auto' : 'none',
                                textDecoration: 'none',
                            }}
                        />
                    ))}
                    {meta?.total !== undefined && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                            {meta.from}–{meta.to} dari {meta.total}
                        </span>
                    )}
                </div>
            )}
        </AppLayout>
    )
}
