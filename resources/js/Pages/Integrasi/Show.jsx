import { useState } from 'react'
import { router, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    RefreshCw, Settings as SettingsIcon, Power, Copy, Check,
    AlertTriangle, ArrowLeft,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import Donut from '@/Components/Donut'
import DataTable from '@/Components/DataTable'

const STATUS_INFO = {
    connected: { label: 'Terhubung',  tone: 'approve' },
    syncing:   { label: 'Sinkron',    tone: 'review'  },
    limited:   { label: 'Konfigurasi',tone: 'kajian'  },
    error:     { label: 'Error',      tone: 'rejected'},
    available: { label: 'Tersedia',   tone: 'draft'   },
    inactive:  { label: 'Nonaktif',   tone: 'draft'   },
}

function CopyField({ label, value }) {
    const [copied, setCopied] = useState(false)
    function handleCopy() {
        if (typeof navigator !== 'undefined' && navigator.clipboard && value) {
            navigator.clipboard.writeText(value).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
            })
        }
    }
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', background: 'var(--ink-50)',
            border: '1px solid var(--ink-100)', borderRadius: 8,
        }}>
            <span style={{ fontSize: 11.5, color: 'var(--ink-500)', minWidth: 110, fontWeight: 600 }}>{label}</span>
            <span style={{
                flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{value ?? '—'}</span>
            <button type="button" className="btn ghost sm" onClick={handleCopy} disabled={!value}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Tersalin' : 'Salin'}
            </button>
        </div>
    )
}

export default function IntegrasiShow({ integration, logs = [] }) {
    function fmt(ts) {
        if (!ts) return '—'
        return new Date(ts).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    function handleSync() {
        router.post(route('integrations.sync', integration.id), {}, { preserveScroll: true })
    }

    const meta = STATUS_INFO[integration.status] ?? STATUS_INFO.available
    const cron = integration.config_json?.cron ?? '—'
    const health = Number(integration.health_score ?? 0)
    const healthColor =
        health >= 90 ? 'var(--brand-500)' :
        health >= 70 ? 'var(--amber-600)' :
        health >  0  ? 'var(--rose-600)'  : 'var(--ink-300)'

    const configEntries = Object.entries(integration.config_json ?? {})

    return (
        <AppLayout title={`Integrasi · ${integration.name}`}>
            <PageHeader
                title={<span className="display">{integration.name}</span>}
                description={integration.description}
                breadcrumbs={[
                    { label: 'Sistem' },
                    { label: 'Integrasi', href: route('integrations.index') },
                    { label: integration.name },
                ]}
                actions={
                    <>
                        <Link href={route('integrations.index')} className="btn ghost">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                        <button type="button" className="btn ghost" onClick={handleSync}>
                            <RefreshCw size={14} /> Sync Now
                        </button>
                        <button type="button" className="btn ghost">
                            <SettingsIcon size={14} /> Edit Config
                        </button>
                        <button type="button" className="btn ghost" style={{ color: 'var(--rose-600)' }}>
                            <Power size={14} /> Disable
                        </button>
                    </>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                {/* LEFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Description card */}
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Ringkasan Integrasi</h3>
                                <div className="sub">Status koneksi & metadata</div>
                            </div>
                            <Badge status={meta.tone} label={meta.label} />
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <Tag tone="brand">{integration.category}</Tag>
                                {integration.is_critical && <Tag tone="rose">Critical</Tag>}
                                {(integration.flows_json ?? []).map(f => <Tag key={f}>{f}</Tag>)}
                            </div>
                            <div style={{ color: 'var(--ink-700)', fontSize: 13.5, lineHeight: 1.6 }}>
                                {integration.description}
                            </div>
                        </div>
                    </div>

                    {/* Sync schedule */}
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Sync Schedule</h3>
                                <div className="sub">Jadwal sinkronisasi otomatis</div>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Cron Expression</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 4 }}>{cron}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Last Sync</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 4 }}>{fmt(integration.last_sync_at)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Next Sync</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 4 }}>{fmt(integration.next_sync_at)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent sync logs */}
                    <DataTable
                        title="Recent Sync Logs"
                        subtitle="8 sinkronisasi terakhir"
                        data={logs}
                        columns={[
                                    {
                                        key: 'timestamp',
                                        header: 'Timestamp',
                                        render: (r) => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.timestamp}</span>,
                                    },
                                    {
                                        key: 'status',
                                        header: 'Status',
                                        render: (r) => <Badge status={r.status === 'success' ? 'approve' : 'rejected'} label={r.status === 'success' ? 'Success' : 'Failed'} />,
                                    },
                                    {
                                        key: 'records_synced',
                                        header: 'Records',
                                        render: (r) => <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.records_synced.toLocaleString('id-ID')}</span>,
                                    },
                                    {
                                        key: 'duration_ms',
                                        header: 'Duration',
                                        render: (r) => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.duration_ms} ms</span>,
                                    },
                                    {
                                        key: 'error',
                                        header: 'Error',
                                        render: (r) => r.error
                                            ? <span style={{ color: 'var(--rose-600)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <AlertTriangle size={12} /> {r.error}
                                              </span>
                                            : <span style={{ color: 'var(--ink-500)' }}>—</span>,
                                    },
                                ]}
                            />
                </div>

                {/* RIGHT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Health Score</h3>
                                <div className="sub">Indeks kesehatan integrasi</div>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'grid', placeItems: 'center', padding: '24px 16px' }}>
                            <Donut
                                value={health}
                                size={180}
                                thickness={18}
                                color={healthColor}
                                centerLabel="HEALTH"
                                centerValue={`${health.toFixed(0)}%`}
                                centerSub={meta.label}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Configuration</h3>
                                <div className="sub">Parameter aktif (read-only)</div>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {configEntries.length === 0 && (
                                <div style={{ color: 'var(--ink-500)', fontSize: 12.5 }}>Belum ada konfigurasi.</div>
                            )}
                            {configEntries.map(([k, v]) => (
                                <div key={k} style={{
                                    display: 'flex', justifyContent: 'space-between', gap: 12,
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                                    padding: '6px 10px', background: 'var(--ink-50)', borderRadius: 6,
                                }}>
                                    <span style={{ color: 'var(--ink-500)' }}>{k}</span>
                                    <span style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{String(v)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Endpoint &amp; Webhook</h3>
                                <div className="sub">URL konektor</div>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <CopyField label="Endpoint URL" value={integration.endpoint_url} />
                            <CopyField label="Webhook URL" value={integration.webhook_url} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
