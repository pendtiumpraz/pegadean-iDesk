import { Head, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    ArrowLeft,
    Bot,
    AlertTriangle,
    Lightbulb,
    ExternalLink,
    FileText,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Donut from '@/Components/Donut'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import AICard from '@/Components/AICard'

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

function scoreLabel(num) {
    if (num === null || num === undefined || Number.isNaN(num)) return 'Belum tersedia'
    if (num < 40) return 'Perlu Perbaikan'
    if (num < 70) return 'Cukup'
    return 'Baik'
}

function normalizeSeverity(sev) {
    const s = (sev ?? '').toString().toLowerCase().trim()
    if (s === 'high' || s === 'tinggi' || s === 'critical') return 'high'
    if (s === 'low' || s === 'rendah' || s === 'minor') return 'low'
    return 'med'
}

function safeJsonParse(input) {
    if (!input) return []
    if (Array.isArray(input)) return input
    try {
        const parsed = typeof input === 'string' ? JSON.parse(input) : input
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

/* ───────── page ───────── */
export default function AiReviewShow({ review, policy, serkep }) {
    const sm = STATUS_MAP[review?.status] ?? {
        tone: 'draft',
        label: review?.status ?? '—',
    }
    const num =
        review?.score !== null && review?.score !== undefined && review?.score !== ''
            ? Number(review.score)
            : null
    const color = scoreColor(num)
    const label = scoreLabel(num)
    const modelUsed = review?.model_used ?? review?.ai_model

    const issues = safeJsonParse(review?.issues_json ?? review?.findings)
    const recommendations = safeJsonParse(review?.recommendations_json ?? review?.recommendations)

    const docTitle = policy?.judul ?? serkep?.title ?? review?.serkep?.title
    const docNumber = policy?.nomor_kebijakan ?? serkep?.nomor ?? review?.serkep?.nomor
    const docRoute = policy?.id
        ? route('policies.show', policy.id)
        : (serkep?.id ?? review?.serkep_id)
          ? route('serkep.show', serkep?.id ?? review?.serkep_id)
          : null

    return (
        <AppLayout title={`AI Review — ${docTitle ?? `#${review?.id}`}`}>
            <Head title={`AI Review #${review?.id} · iDesk`} />

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda' },
                    { label: 'AI Review', href: route('ai-reviews.index') },
                    { label: docNumber ?? docTitle ?? `#${review?.id}` },
                ]}
                title={docTitle ?? `AI Review #${review?.id}`}
                description={docNumber ? `Skor AI: ${num ?? '—'} / 100 · ${label}` : 'Detail hasil analisis AI'}
                actions={
                    <>
                        <Link href={route('ai-reviews.index')} className="btn ghost">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                        {docRoute && (
                            <Link href={docRoute} className="btn ghost">
                                <ExternalLink size={14} />{' '}
                                {policy?.id ? 'Lihat Kebijakan' : 'Lihat SERKEP'}
                            </Link>
                        )}
                    </>
                }
            />

            {/* Two column grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
                    gap: 16,
                }}
            >
                {/* LEFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                    {/* Skor & Rekomendasi */}
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Skor & Rekomendasi</h3>
                                <div className="sub">Hasil agregasi AI Co-pilot</div>
                            </div>
                        </div>
                        <div
                            className="card-body"
                            style={{
                                display: 'flex',
                                gap: 32,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Donut
                                value={num ?? 0}
                                size={160}
                                thickness={16}
                                color={color}
                                centerValue={num ?? '—'}
                                centerSub="/ 100"
                                centerLabel={label}
                            />
                            <div style={{ flex: 1, minWidth: 220 }}>
                                <div
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 600,
                                        color,
                                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                                    }}
                                >
                                    {label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--ink-500)',
                                        marginTop: 4,
                                    }}
                                >
                                    Skor kepatuhan AI berdasarkan analisis dokumen, rujukan
                                    regulasi, dan deteksi konflik antar pasal.
                                </div>

                                <div
                                    style={{
                                        marginTop: 16,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6,
                                        fontSize: 12.5,
                                        color: 'var(--ink-700)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                background: 'var(--rose-600)',
                                                borderRadius: 2,
                                            }}
                                        />
                                        Temuan: <b>{issues.length}</b>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span
                                            style={{
                                                width: 8,
                                                height: 8,
                                                background: 'var(--brand-600)',
                                                borderRadius: 2,
                                            }}
                                        />
                                        Rekomendasi: <b>{recommendations.length}</b>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary blurb */}
                        {review?.summary && (
                            <div
                                className="card-body"
                                style={{
                                    borderTop: '1px solid var(--ink-100)',
                                    fontSize: 13.5,
                                    lineHeight: 1.7,
                                    color: 'var(--ink-700)',
                                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: 6,
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <Bot size={14} style={{ color: 'var(--brand-600)' }} />{' '}
                                    Ringkasan AI
                                </div>
                                {review.summary}
                            </div>
                        )}
                    </div>

                    {/* Temuan AI */}
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <AlertTriangle size={18} style={{ color: 'var(--rose-600)' }} />
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: 'var(--ink-900)',
                                }}
                            >
                                Temuan AI
                            </h3>
                            <Tag tone="rose">{issues.length}</Tag>
                        </div>
                        {issues.length === 0 ? (
                            <div
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    color: 'var(--ink-500)',
                                    fontSize: 13,
                                }}
                            >
                                Tidak ada temuan.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {issues.map((issue, i) => {
                                    const isObj = typeof issue === 'object' && issue !== null
                                    const sev = normalizeSeverity(isObj ? issue.severity : null)
                                    const title =
                                        (isObj && (issue.title ?? issue.heading)) ||
                                        `Temuan #${i + 1}`
                                    const body = isObj
                                        ? (issue.description ?? issue.text ?? issue.body ?? '')
                                        : String(issue)
                                    const pasal = isObj ? (issue.pasal ?? issue.section) : null
                                    const quote = isObj ? (issue.quote ?? issue.kutipan) : null
                                    const pasalRef = isObj ? (issue.reference ?? issue.rujukan) : null
                                    return (
                                        <AICard
                                            key={i}
                                            severity={sev}
                                            title={title}
                                            pasal={pasal}
                                            body={body}
                                            quote={quote}
                                            pasalRef={pasalRef}
                                            onAccept={() => {}}
                                            onDiscuss={() => {}}
                                            onIgnore={() => {}}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Rekomendasi */}
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <Lightbulb size={18} style={{ color: 'var(--brand-600)' }} />
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: 'var(--ink-900)',
                                }}
                            >
                                Rekomendasi
                            </h3>
                            <Tag tone="brand">{recommendations.length}</Tag>
                        </div>
                        {recommendations.length === 0 ? (
                            <div
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    color: 'var(--ink-500)',
                                    fontSize: 13,
                                }}
                            >
                                Tidak ada rekomendasi.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recommendations.map((rec, i) => {
                                    const isObj = typeof rec === 'object' && rec !== null
                                    const title =
                                        (isObj && (rec.title ?? rec.heading)) ||
                                        `Rekomendasi #${i + 1}`
                                    const body = isObj
                                        ? (rec.description ?? rec.text ?? rec.body ?? '')
                                        : String(rec)
                                    const pasal = isObj ? (rec.pasal ?? rec.section) : null
                                    const pasalRef = isObj ? (rec.reference ?? rec.rujukan) : null
                                    return (
                                        <AICard
                                            key={i}
                                            severity="low"
                                            title={title}
                                            pasal={pasal}
                                            body={body}
                                            pasalRef={pasalRef}
                                            onAccept={() => {}}
                                            onDiscuss={() => {}}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT rail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                    {/* Detail */}
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Detail Review</h3>
                                <div className="sub">Metadata analisis</div>
                            </div>
                        </div>
                        <div
                            className="card-body"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                fontSize: 13,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-500)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '.04em',
                                        marginBottom: 4,
                                        fontWeight: 600,
                                    }}
                                >
                                    Status
                                </div>
                                <Badge status={sm.tone} label={sm.label} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-500)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '.04em',
                                        marginBottom: 4,
                                        fontWeight: 600,
                                    }}
                                >
                                    Model
                                </div>
                                <span
                                    style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontSize: 12.5,
                                        color: 'var(--ink-700)',
                                    }}
                                >
                                    {modelUsed ?? '—'}
                                </span>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: 'var(--ink-500)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '.04em',
                                        marginBottom: 4,
                                        fontWeight: 600,
                                    }}
                                >
                                    Tanggal
                                </div>
                                <span style={{ color: 'var(--ink-700)' }}>
                                    {review?.created_at ?? '—'}
                                </span>
                            </div>
                            {review?.reviewer && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-500)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '.04em',
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Reviewer
                                    </div>
                                    <span style={{ color: 'var(--ink-700)' }}>
                                        {review.reviewer}
                                    </span>
                                </div>
                            )}
                            {review?.version !== undefined && review?.version !== null && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-500)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '.04em',
                                            marginBottom: 4,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Versi
                                    </div>
                                    <span
                                        style={{
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: 12.5,
                                            color: 'var(--ink-700)',
                                        }}
                                    >
                                        v{review.version}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Linked policy/serkep card */}
                    {(policy || serkep || review?.serkep) && (
                        <div className="card">
                            <div className="card-head">
                                <div>
                                    <h3>{policy ? 'Kebijakan Tertaut' : 'SERKEP Tertaut'}</h3>
                                    <div className="sub">Dokumen sumber</div>
                                </div>
                            </div>
                            <div
                                className="card-body"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                    fontSize: 13,
                                }}
                            >
                                {docNumber && (
                                    <div
                                        style={{
                                            fontFamily: 'JetBrains Mono, monospace',
                                            fontSize: 12,
                                            color: 'var(--ink-500)',
                                        }}
                                    >
                                        {docNumber}
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: 'var(--ink-900)',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {docTitle ?? '—'}
                                </div>
                                {(policy?.kategori ||
                                    serkep?.jenis ||
                                    review?.serkep?.jenis) && (
                                    <div>
                                        <Tag tone="brand">
                                            {policy?.kategori ??
                                                serkep?.jenis ??
                                                review?.serkep?.jenis}
                                        </Tag>
                                    </div>
                                )}
                                {docRoute && (
                                    <Link
                                        href={docRoute}
                                        className="btn ghost sm"
                                        style={{ width: 'fit-content', marginTop: 4 }}
                                    >
                                        <FileText size={13} /> Buka Dokumen
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
