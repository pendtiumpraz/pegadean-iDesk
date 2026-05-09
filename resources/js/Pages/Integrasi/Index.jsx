import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Plus, RefreshCw, Settings as SettingsIcon, Copy, Check,
    ShieldCheck, AlertOctagon, Flag, BookOpen, ShieldAlert,
    Inbox as InboxIcon, Send, Plug, Activity, XCircle, Link2,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Tag from '@/Components/Tag'
import HBar from '@/Components/HBar'

/* ── status helpers ── */
const STATUS_INFO = {
    connected: { label: 'Terhubung',  dot: 'var(--brand-500)', tone: 'brand' },
    syncing:   { label: 'Sinkron…',   dot: 'var(--amber-600)', tone: 'amber' },
    limited:   { label: 'Konfigurasi',dot: 'var(--amber-600)', tone: 'amber' },
    error:     { label: 'Error',      dot: 'var(--rose-600)',  tone: 'rose'  },
    available: { label: 'Tersedia',   dot: 'var(--ink-300)',   tone: 'neutral' },
    inactive:  { label: 'Nonaktif',   dot: 'var(--ink-300)',   tone: 'neutral' },
}

const CATEGORY_ICON = {
    compliance:    ShieldCheck,
    core_banking:  Activity,
    reporting:     Send,
    document:      InboxIcon,
    communication: Link2,
}

const SLUG_ICON = {
    becomply: ShieldCheck,
    rcs:      AlertOctagon,
    apasi:    Flag,
    simpel:   BookOpen,
    perisai:  ShieldAlert,
    'e-office': InboxIcon,
    ppatk:    Send,
    ojk:      BookOpen,
}

function relTime(ts) {
    if (!ts) return 'Belum pernah'
    const d = new Date(ts)
    const diff = (Date.now() - d.getTime()) / 1000
    if (diff < 60) return `${Math.round(diff)} detik lalu`
    if (diff < 3600) return `${Math.round(diff / 60)} menit lalu`
    if (diff < 86400) return `${Math.round(diff / 3600)} jam lalu`
    return `${Math.round(diff / 86400)} hari lalu`
}

function CopyField({ label, value }) {
    const [copied, setCopied] = useState(false)
    function handleCopy() {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
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
            }}>{value}</span>
            <button type="button" className="btn ghost sm" onClick={handleCopy}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Tersalin' : 'Salin'}
            </button>
        </div>
    )
}

function FlowDiagram() {
    const stages = [
        {
            title: 'External Sources',
            sub:   'Sistem inti & feed regulasi',
            items: ['BeComply', 'RCS', 'APASI', 'PERISAI'],
            color: 'var(--brand-600)',
        },
        {
            title: 'iDesk Compliance',
            sub:   'Orkestrasi & AI Co-pilot',
            items: ['Ingest', 'Normalize', 'AI Review', 'Audit'],
            color: 'var(--gold-600)',
        },
        {
            title: 'Downstream',
            sub:   'Pelaporan & repositori',
            items: ['PPATK', 'OJK', 'SIMPEL'],
            color: 'var(--info-600)',
        },
    ]

    return (
        <>
            <style>{`
                @keyframes idesk-flow-pulse {
                    0%   { transform: translateX(0);    opacity: 0.2; }
                    50%  { opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0.2; }
                }
                .flow-track {
                    position: relative;
                    height: 2px; background: var(--ink-200); border-radius: 1px;
                    flex: 1; overflow: hidden;
                }
                .flow-dot {
                    position: absolute; top: -3px; width: 24px; height: 8px;
                    border-radius: 4px; background: var(--brand-500);
                    animation: idesk-flow-pulse 2.5s linear infinite;
                }
            `}</style>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
                {stages.map((s, i) => (
                    <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <div style={{
                            flex: 1,
                            border: '1px solid var(--ink-200)', borderRadius: 12,
                            padding: 16, background: 'var(--paper)',
                            display: 'flex', flexDirection: 'column', gap: 8,
                            minHeight: 130,
                        }}>
                            <div>
                                <div style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontWeight: 600, fontSize: 14, color: s.color }}>
                                    {s.title}
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{s.sub}</div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {s.items.map(it => <Tag key={it} size="sm" tone="neutral">{it}</Tag>)}
                            </div>
                        </div>
                        {i < stages.length - 1 && (
                            <div className="flow-track">
                                <span className="flow-dot" style={{ animationDelay: `${i * 0.6}s` }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}

export default function IntegrasiIndex({ integrations = [], kpis = {} }) {
    function handleSync(id) {
        router.post(route('integrations.sync', id), {}, { preserveScroll: true })
    }

    return (
        <AppLayout title="Integrasi Sistem">
            <PageHeader
                title={<span className="display">Integrasi Sistem</span>}
                description="iDesk berdiri di atas Compliance Blueprint Pegadean — terhubung ke sistem inti dan layanan eksternal."
                breadcrumbs={[{ label: 'Sistem' }, { label: 'Integrasi' }]}
                actions={
                    <button type="button" className="btn primary">
                        <Plus size={14} /> Tambah Integrasi
                    </button>
                }
            />

            {/* KPIs */}
            <div className="kpi-grid">
                <StatCard
                    label="Active"
                    value={kpis.active ?? 0}
                    tone="brand"
                    icon={Plug}
                    deltaLabel="terhubung sehat"
                />
                <StatCard
                    label="Inactive"
                    value={kpis.inactive ?? 0}
                    tone="info"
                    icon={Activity}
                    deltaLabel="tersedia / belum aktif"
                />
                <StatCard
                    label="Error / Limited"
                    value={kpis.error ?? 0}
                    tone="rose"
                    icon={XCircle}
                    deltaLabel="butuh perhatian"
                />
                <StatCard
                    label="Synced Today"
                    value={kpis.synced_today ?? 0}
                    tone="gold"
                    icon={RefreshCw}
                    deltaLabel="dalam 24 jam"
                />
            </div>

            {/* Card grid */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {integrations.map((it) => {
                    const meta = STATUS_INFO[it.status] ?? STATUS_INFO.available
                    const Icon = SLUG_ICON[it.slug] ?? CATEGORY_ICON[it.category] ?? Plug
                    const health = Number(it.health_score ?? 0)
                    const healthColor =
                        health >= 90 ? 'var(--brand-500)' :
                        health >= 70 ? 'var(--amber-600)' :
                        health >  0  ? 'var(--rose-600)'  : 'var(--ink-300)'

                    return (
                        <div key={it.id} className="card" style={{
                            display: 'flex', flexDirection: 'column', gap: 12, padding: 16,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'var(--ink-50)', border: '1px solid var(--ink-200)',
                                    display: 'grid', placeItems: 'center', flex: 'none',
                                    color: 'var(--brand-600)',
                                }}>
                                    <Icon size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontWeight: 600, fontSize: 15 }}>
                                        {it.name}
                                    </div>
                                    <Tag size="sm" tone="neutral">{it.category ?? '—'}</Tag>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: meta.dot,
                                    boxShadow: `0 0 0 3px ${meta.dot}22`,
                                }} />
                                <span style={{ fontWeight: 600 }}>{meta.label}</span>
                                <span style={{ color: 'var(--ink-500)' }}>·</span>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                                    color: 'var(--ink-500)',
                                }}>{relTime(it.last_sync_at)}</span>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink-500)', marginBottom: 4 }}>
                                    <span>Health Score</span>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--ink-900)' }}>
                                        {health.toFixed(1)}
                                    </span>
                                </div>
                                <HBar value={health} max={100} color={healthColor} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                                <button
                                    type="button"
                                    className="btn ghost sm"
                                    onClick={() => handleSync(it.id)}
                                    disabled={it.status === 'available'}
                                >
                                    <RefreshCw size={12} /> Sync Now
                                </button>
                                <Link href={route('integrations.show', it.id)} className="btn ghost sm">
                                    <SettingsIcon size={12} /> Configure
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Data Flow Pipeline */}
            <div className="card" style={{ marginTop: 16 }}>
                <div className="card-head">
                    <div>
                        <h3>Data Flow Pipeline</h3>
                        <div className="sub">Aliran data otomatis antara sistem inti, iDesk, dan downstream</div>
                    </div>
                </div>
                <div className="card-body">
                    <FlowDiagram />
                </div>
            </div>

            {/* API & Webhook Config */}
            <div className="card" style={{ marginTop: 16 }}>
                <div className="card-head">
                    <div>
                        <h3>API &amp; Webhook Config</h3>
                        <div className="sub">Untuk integrasi kustom — gunakan endpoint berikut</div>
                    </div>
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                        background: 'var(--ink-900)', color: 'oklch(0.85 0.03 155)',
                        borderRadius: 10, padding: '14px 16px',
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.7,
                    }}>
                        <div style={{ color: 'var(--gold-500)' }}>POST</div>
                        <div>https://api.idesk.pegadean/v2/serkep</div>
                        <div style={{ color: 'oklch(0.65 0.04 155)', marginTop: 8 }}>{`{`}</div>
                        <div style={{ paddingLeft: 18 }}>"title": string,</div>
                        <div style={{ paddingLeft: 18 }}>"pemrakarsa": string,</div>
                        <div style={{ paddingLeft: 18 }}>"file": base64</div>
                        <div style={{ color: 'oklch(0.65 0.04 155)' }}>{`}`}</div>
                    </div>

                    <CopyField label="API Endpoint"  value="https://api.idesk.pegadean/v2" />
                    <CopyField label="Webhook URL"   value="https://api.idesk.pegadean/v2/hooks/{integration}" />
                    <CopyField label="API Key"       value="idesk_pk_live_••••••••••••a72f" />
                </div>
            </div>
        </AppLayout>
    )
}
