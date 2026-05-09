import { useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Bot,
    Sparkles,
    AlertOctagon,
    CheckCircle,
    Eye,
    Search,
    RefreshCw,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Donut from '@/Components/Donut'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'

/* ───────── helpers ───────── */
const STATUS_MAP = {
    pending:   { tone: 'pending',  label: 'Pending' },
    running:   { tone: 'review',   label: 'Running' },
    completed: { tone: 'approve',  label: 'Selesai' },
    failed:    { tone: 'rejected', label: 'Gagal' },
}

function scoreColor(num) {
    if (num === null || num === undefined || Number.isNaN(num)) return 'var(--ink-300)'
    if (num < 40) return 'var(--rose-600)'
    if (num < 70) return 'var(--amber-600)'
    return 'var(--brand-600)'
}

function fmtDate(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

/* ───────── page ───────── */
export default function AiReviewIndex({ reviews, filters }) {
    const { data = [], links = [], meta = {} } = reviews ?? {}
    const [search, setSearch] = useState(filters?.search ?? '')
    const [status, setStatus] = useState(filters?.status ?? '')
    const [model, setModel] = useState(filters?.model ?? '')

    const stats = useMemo(() => {
        const total = data.length
        let scoreSum = 0
        let scoreCount = 0
        let highRisk = 0
        let approved = 0
        for (const r of data) {
            const n = Number(r.score)
            if (!Number.isNaN(n) && r.score !== null && r.score !== undefined) {
                scoreSum += n
                scoreCount++
                if (n < 40) highRisk++
            }
            // Try to count high-severity findings
            try {
                const issues = r.issues_json ? JSON.parse(r.issues_json) : []
                if (Array.isArray(issues)) {
                    highRisk += issues.filter(
                        (i) => typeof i === 'object' && (i.severity === 'high' || i.severity === 'tinggi')
                    ).length
                }
            } catch {}
            if (r.status === 'completed') approved++
        }
        return {
            total,
            avgScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
            highRisk,
            approved,
        }
    }, [data])

    const modelOptions = useMemo(() => {
        const set = new Set()
        for (const r of data) {
            const m = r.model_used ?? r.ai_model
            if (m) set.add(m)
        }
        return Array.from(set)
    }, [data])

    function applyFilter(overrides = {}) {
        router.get(
            route('ai-reviews.index'),
            {
                search:  overrides.search  !== undefined ? overrides.search  : search,
                status:  overrides.status  !== undefined ? overrides.status  : status,
                model:   overrides.model   !== undefined ? overrides.model   : model,
            },
            { preserveState: true, replace: true }
        )
    }

    function handleRefresh() {
        router.reload({ only: ['reviews'] })
    }

    return (
        <AppLayout title="AI Review">
            <Head title="AI Review · iDesk" />

            <PageHeader
                breadcrumbs={[{ label: 'Beranda' }, { label: 'AI Review Engine' }]}
                title="AI Review Engine"
                description="Hasil analisis AI Co-pilot terhadap dokumen kepatuhan — skor, temuan, dan rekomendasi otomatis."
                actions={
                    <button type="button" className="btn ghost" onClick={handleRefresh}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                }
            />

            {/* KPI grid */}
            <div className="kpi-grid">
                <StatCard
                    label="Total Reviews"
                    value={meta?.total ?? stats.total}
                    unit="dokumen"
                    icon={Bot}
                    tone="brand"
                />
                <StatCard
                    label="Skor Rata-rata"
                    value={stats.avgScore || '—'}
                    unit="/ 100"
                    icon={Sparkles}
                    tone="info"
                />
                <StatCard
                    label="Temuan Risiko Tinggi"
                    value={stats.highRisk}
                    unit="item"
                    icon={AlertOctagon}
                    tone="rose"
                />
                <StatCard
                    label="Selesai Disetujui"
                    value={stats.approved}
                    unit="dokumen"
                    icon={CheckCircle}
                    tone="brand"
                />
            </div>

            {/* Toolbar */}
            <div
                className="card"
                style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                <div className="global-search" style={{ width: 280 }}>
                    <span className="ic">
                        <Search size={14} />
                    </span>
                    <input
                        placeholder="Cari kebijakan / serkep…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                        style={{ height: 32 }}
                    />
                </div>

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value)
                        applyFilter({ status: e.target.value })
                    }}
                    style={{
                        height: 32,
                        padding: '0 0.6rem',
                        border: '1px solid var(--ink-200)',
                        borderRadius: 6,
                        background: 'var(--paper, #fff)',
                        color: 'var(--ink-700)',
                        fontSize: 13,
                    }}
                >
                    <option value="">Semua Status</option>
                    {Object.entries(STATUS_MAP).map(([k, v]) => (
                        <option key={k} value={k}>
                            {v.label}
                        </option>
                    ))}
                </select>

                <select
                    value={model}
                    onChange={(e) => {
                        setModel(e.target.value)
                        applyFilter({ model: e.target.value })
                    }}
                    style={{
                        height: 32,
                        padding: '0 0.6rem',
                        border: '1px solid var(--ink-200)',
                        borderRadius: 6,
                        background: 'var(--paper, #fff)',
                        color: 'var(--ink-700)',
                        fontSize: 13,
                    }}
                >
                    <option value="">Semua Model</option>
                    {modelOptions.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="btn ghost"
                    onClick={() => applyFilter()}
                    style={{ marginLeft: 'auto' }}
                >
                    Terapkan
                </button>
            </div>

            {/* Cards grid */}
            {data.length === 0 ? (
                <div
                    className="card"
                    style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ink-500)', marginTop: 16 }}
                >
                    Belum ada hasil AI Review.
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                        gap: 16,
                        marginTop: 16,
                    }}
                >
                    {data.map((row) => {
                        const sm = STATUS_MAP[row.status] ?? {
                            tone: 'draft',
                            label: row.status ?? '—',
                        }
                        const num =
                            row.score !== null && row.score !== undefined && row.score !== ''
                                ? Number(row.score)
                                : null
                        const color = scoreColor(num)
                        const docTitle =
                            row.policy?.judul ??
                            row.serkep?.title ??
                            (row.policy_id ? `Policy #${row.policy_id}` : `Serkep #${row.serkep_id ?? row.id}`)
                        const docNumber =
                            row.policy?.nomor_kebijakan ?? row.serkep?.nomor
                        const docRoute = row.policy_id
                            ? route('policies.show', row.policy_id)
                            : row.serkep_id
                              ? route('serkep.show', row.serkep_id)
                              : null
                        const summary =
                            row.summary ??
                            row.ringkasan ??
                            'Ringkasan belum tersedia. Klik detail untuk melihat temuan dan rekomendasi.'
                        const modelUsed = row.model_used ?? row.ai_model

                        return (
                            <div
                                key={row.id}
                                className="card"
                                style={{
                                    padding: 16,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                {/* top: title + donut */}
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {docNumber && (
                                            <div
                                                style={{
                                                    fontFamily: 'JetBrains Mono, monospace',
                                                    fontSize: 11,
                                                    color: 'var(--ink-500)',
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {docNumber}
                                            </div>
                                        )}
                                        {docRoute ? (
                                            <Link
                                                href={docRoute}
                                                style={{
                                                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                                                    fontSize: 16,
                                                    fontWeight: 500,
                                                    color: 'var(--ink-900)',
                                                    textDecoration: 'none',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {docTitle}
                                            </Link>
                                        ) : (
                                            <div
                                                style={{
                                                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                                                    fontSize: 16,
                                                    fontWeight: 500,
                                                    color: 'var(--ink-900)',
                                                }}
                                            >
                                                {docTitle}
                                            </div>
                                        )}
                                    </div>
                                    <Donut
                                        value={num ?? 0}
                                        size={72}
                                        thickness={9}
                                        color={color}
                                        centerValue={num ?? '—'}
                                        centerSub="/100"
                                    />
                                </div>

                                {/* summary */}
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        lineHeight: 1.6,
                                        color: 'var(--ink-700)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {summary}
                                </p>

                                {/* footer */}
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        paddingTop: 8,
                                        borderTop: '1px solid var(--ink-100)',
                                    }}
                                >
                                    <Badge status={sm.tone} label={sm.label} />
                                    {modelUsed && (
                                        <Tag
                                            tone="ink"
                                            style={{
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontSize: 11,
                                            }}
                                        >
                                            {modelUsed}
                                        </Tag>
                                    )}
                                    <span style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                                        {fmtDate(row.created_at)}
                                    </span>
                                    <div style={{ flex: 1 }} />
                                    <Link
                                        href={route('ai-reviews.show', row.id)}
                                        className="icon-btn"
                                        style={{ width: 28, height: 28 }}
                                        title="Lihat Detail"
                                    >
                                        <Eye size={14} />
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {links.length > 0 && (
                <div
                    style={{
                        marginTop: 16,
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        display: 'flex',
                        gap: 4,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveState
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            style={{
                                padding: '0.25rem 0.625rem',
                                borderRadius: 6,
                                fontSize: 13,
                                border: '1px solid var(--ink-200)',
                                background: link.active ? 'var(--brand-600)' : 'var(--paper, #fff)',
                                color: link.active
                                    ? '#fff'
                                    : link.url
                                      ? 'var(--ink-700)'
                                      : 'var(--ink-400)',
                                pointerEvents: link.url ? 'auto' : 'none',
                                textDecoration: 'none',
                            }}
                        />
                    ))}
                    {meta?.total !== undefined && (
                        <span
                            style={{
                                marginLeft: 'auto',
                                fontSize: 12,
                                color: 'var(--ink-500)',
                            }}
                        >
                            {meta.from ?? 1}–{meta.to ?? data.length} dari {meta.total}
                        </span>
                    )}
                </div>
            )}
        </AppLayout>
    )
}
