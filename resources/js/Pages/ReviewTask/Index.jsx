import { useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    RefreshCw,
    Check,
    X,
    Send,
    HelpCircle,
    Sparkles,
    Eye,
    Download,
    Link2,
    MoreHorizontal,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Inbox from '@/Components/Inbox'
import InboxItem from '@/Components/InboxItem'
import Avatar from '@/Components/Avatar'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import AISuggestionCallout from '@/Components/AISuggestionCallout'

/* ───────── helpers ───────── */
function isOverdue(task) {
    if (!task?.deadline) return false
    if (task?.status === 'completed' || task?.status === 'selesai') return false
    return new Date(task.deadline) < new Date()
}

function fmtRelative(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return 'baru saja'
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt`
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam`
    if (diff < 86400 * 2) return 'Kemarin'
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari`
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

function slaText(deadline) {
    if (!deadline) return null
    const d = new Date(deadline)
    if (Number.isNaN(d.getTime())) return null
    const now = new Date()
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { label: `SLA ${diffDays} hari`, overdue: true }
    if (diffDays === 0) return { label: 'SLA hari ini', overdue: true }
    return { label: `${diffDays} hari`, overdue: false }
}

const JENIS_LABEL = { policy: 'Kebijakan', serkep: 'Serkep' }

function statusOf(task) {
    if (task?.status === 'completed' || task?.status === 'selesai') {
        return { tone: 'approve', label: 'Selesai' }
    }
    if (isOverdue(task) || task?.status === 'overdue') {
        return { tone: 'rejected', label: 'Terlambat' }
    }
    if (task?.status === 'in_progress') {
        return { tone: 'review', label: 'In Progress' }
    }
    return { tone: 'pending', label: 'Pending' }
}

/* ───────── chip filter ───────── */
const CHIPS = [
    { value: '',            label: 'Semua' },
    { value: 'pending',     label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'overdue',     label: 'Overdue' },
    { value: 'completed',   label: 'Completed' },
]

/* ───────── detail pane ───────── */
function DetailPane({ task }) {
    if (!task) return null

    const fromName = task.dari_user_name ?? task.dari_user?.name ?? task.assigned_by ?? 'Sistem'
    const fromEmail = task.dari_user?.email ?? null
    const fromRole = task.dari_user_role ?? task.dari_user?.role ?? null
    const sla = slaText(task.deadline)
    const stat = statusOf(task)
    const overdue = stat.tone === 'rejected'

    const docTitle = task.serkep?.title ?? task.policy?.judul ?? task.judul_review
    const docNumber = task.serkep?.nomor ?? task.policy?.nomor_kebijakan
    const docRoute =
        task.jenis_dokumen === 'policy' && task.policy_id
            ? route('policies.show', task.policy_id)
            : task.serkep_id
              ? route('serkep.show', task.serkep_id)
              : null

    function handleComplete() {
        if (!confirm('Tandai tugas review ini sebagai selesai?')) return
        router.put(route('reviews.complete', task.id))
    }

    return (
        <>
            {/* avatar header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar name={fromName} size={42} tone="brand" />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{fromName}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                        {fromRole ? `${fromRole} · ` : ''}
                        {fromEmail ? `${fromEmail} · ` : ''}
                        {fmtRelative(task.created_at)}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {docRoute && (
                        <Link href={docRoute} className="btn ghost sm">
                            <Link2 size={13} /> Tautkan
                        </Link>
                    )}
                    <button type="button" className="btn ghost sm">
                        <MoreHorizontal size={13} />
                    </button>
                </div>
            </div>

            {/* serif title */}
            <h2
                style={{
                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                    fontWeight: 500,
                    fontSize: 22,
                    margin: '0 0 8px',
                    letterSpacing: '-.3px',
                }}
            >
                {task.judul_review}
            </h2>

            {/* pill row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={stat.tone} label={stat.label} />
                {task.jenis_dokumen && (
                    <Tag tone="brand">
                        {JENIS_LABEL[task.jenis_dokumen] ?? task.jenis_dokumen}
                    </Tag>
                )}
                {docNumber && <Tag>{docNumber}</Tag>}
                {sla && (
                    <Tag tone={sla.overdue ? 'rose' : 'neutral'}>{sla.label}</Tag>
                )}
                {task.deadline && (
                    <span style={{ fontSize: 12, color: 'var(--ink-500)', alignSelf: 'center' }}>
                        Deadline: {task.deadline}
                    </span>
                )}
            </div>

            {/* serif body */}
            <div
                style={{
                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                    fontSize: 14.5,
                    lineHeight: 1.7,
                    color: 'var(--ink-700)',
                }}
            >
                {task.catatan ? (
                    <p style={{ margin: '0 0 12px' }}>{task.catatan}</p>
                ) : (
                    <p style={{ margin: '0 0 12px', color: 'var(--ink-500)' }}>
                        Tidak ada catatan tambahan untuk tugas review ini. Silakan periksa
                        dokumen terkait dan berikan tanggapan Anda.
                    </p>
                )}
                {docTitle && (
                    <p style={{ margin: 0 }}>
                        Dokumen yang ditinjau:{' '}
                        <b>{docTitle}</b>
                        {docNumber ? ` (${docNumber})` : ''}.
                    </p>
                )}
            </div>

            {/* AI suggestion */}
            <div style={{ marginTop: 20 }}>
                <AISuggestionCallout
                    title="Saran AI sebelum disetujui"
                    body="Periksa pasal 12 ayat 3 untuk konsistensi dengan kebijakan induk. AI Co-pilot mendeteksi rujukan yang berpotensi tidak sinkron dengan KIMRK-4.2."
                />
            </div>

            {/* PDF attachment card */}
            {(task.serkep_id || task.policy_id || docTitle) && (
                <div
                    className="card"
                    style={{
                        marginTop: 18,
                        background: 'var(--ink-50)',
                        borderStyle: 'dashed',
                    }}
                >
                    <div
                        className="card-body"
                        style={{ display: 'flex', alignItems: 'center', gap: 14 }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 56,
                                background: 'var(--paper, #fff)',
                                border: '1px solid var(--ink-200)',
                                borderRadius: 4,
                                display: 'grid',
                                placeItems: 'center',
                                color: 'var(--ink-500)',
                                fontSize: 10,
                                fontWeight: 600,
                            }}
                        >
                            PDF
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {docNumber ?? `Tugas #${task.id}`}_{(docTitle ?? 'review').replace(/\s+/g, '-')}.pdf
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                                {task.jenis_dokumen
                                    ? `${JENIS_LABEL[task.jenis_dokumen] ?? task.jenis_dokumen} · `
                                    : ''}
                                Lampiran review
                            </div>
                        </div>
                        {docRoute && (
                            <Link href={docRoute} className="btn ghost sm">
                                <Eye size={13} /> Buka
                            </Link>
                        )}
                        <button type="button" className="btn ghost sm">
                            <Download size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* footer 4-button row */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: '1px solid var(--ink-200)',
                    flexWrap: 'wrap',
                }}
            >
                <button type="button" className="btn ghost">
                    <X size={14} /> Tolak
                </button>
                <button type="button" className="btn ghost">
                    <Send size={14} /> Disposisi
                </button>
                <button type="button" className="btn ghost">
                    <HelpCircle size={14} /> Klarifikasi
                </button>
                <div style={{ flex: 1 }} />
                {task.status !== 'completed' && task.status !== 'selesai' && (
                    <button type="button" className="btn primary" onClick={handleComplete}>
                        <Check size={14} /> Selesaikan
                    </button>
                )}
            </div>

            {overdue && (
                <div
                    style={{
                        marginTop: 12,
                        padding: '8px 12px',
                        background: 'var(--rose-100, #fee2e2)',
                        color: 'var(--rose-600, #dc2626)',
                        borderRadius: 8,
                        fontSize: 12.5,
                    }}
                >
                    Tugas ini telah melewati batas deadline.
                </div>
            )}
        </>
    )
}

/* ───────── page ───────── */
export default function TugasReviewIndex({ tasks, filters }) {
    const { data = [], links = [], meta = {} } = tasks ?? {}
    const initialStatus = filters?.status ?? ''
    const [activeChip, setActiveChip] = useState(initialStatus)
    const [selectedId, setSelectedId] = useState(() => {
        if (typeof window === 'undefined') return data[0]?.id
        const params = new URLSearchParams(window.location.search)
        const fromUrl = params.get('selected')
        if (fromUrl) return Number(fromUrl) || fromUrl
        return data[0]?.id
    })

    const chips = useMemo(() => {
        const counts = data.reduce(
            (acc, t) => {
                const stat = statusOf(t).tone
                if (stat === 'pending') acc.pending++
                else if (stat === 'review') acc.in_progress++
                else if (stat === 'rejected') acc.overdue++
                else if (stat === 'approve') acc.completed++
                acc.all++
                return acc
            },
            { all: 0, pending: 0, in_progress: 0, overdue: 0, completed: 0 }
        )
        return CHIPS.map(c => ({
            ...c,
            count:
                c.value === ''            ? counts.all          :
                c.value === 'pending'     ? counts.pending      :
                c.value === 'in_progress' ? counts.in_progress  :
                c.value === 'overdue'     ? counts.overdue      :
                c.value === 'completed'   ? counts.completed    :
                undefined,
        }))
    }, [data])

    function handleChip(value) {
        setActiveChip(value)
        router.get(
            route('reviews.index'),
            { status: value || undefined },
            { preserveState: true, replace: true, preserveScroll: true }
        )
    }

    function handleRefresh() {
        router.reload({ only: ['tasks'] })
    }

    return (
        <AppLayout title="Tugas Review">
            <Head title="Tugas Review · iDesk" />

            <PageHeader
                breadcrumbs={[{ label: 'Beranda' }, { label: 'Tugas Review' }]}
                title="Tugas Review"
                description={`${meta?.total ?? data.length} tugas review · pantau dan selesaikan tinjauan dokumen kepatuhan.`}
                actions={
                    <button type="button" className="btn ghost" onClick={handleRefresh}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                }
            />

            {data.length === 0 ? (
                <div
                    className="card"
                    style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--ink-500)' }}
                >
                    Tidak ada tugas review.
                </div>
            ) : (
                <Inbox
                    items={data}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                    getItemId={(item, i) => item.id ?? i}
                    chips={chips}
                    activeChip={activeChip}
                    onChipSelect={handleChip}
                    renderItem={(t) => {
                        const stat = statusOf(t)
                        const overdue = stat.tone === 'rejected'
                        const fromName = t.dari_user_name ?? t.dari_user?.name ?? 'Sistem'
                        const docInfo =
                            t.serkep?.title ??
                            t.policy?.judul ??
                            (t.jenis_dokumen
                                ? JENIS_LABEL[t.jenis_dokumen] ?? t.jenis_dokumen
                                : '')
                        return (
                            <InboxItem
                                from={fromName}
                                time={fmtRelative(t.created_at)}
                                title={t.judul_review}
                                preview={docInfo || t.catatan || '—'}
                                unread={t.status === 'pending'}
                                tags={[
                                    t.jenis_dokumen ? (
                                        <Tag key="j" tone="brand">
                                            {JENIS_LABEL[t.jenis_dokumen] ?? t.jenis_dokumen}
                                        </Tag>
                                    ) : null,
                                    <Badge key="s" status={stat.tone} label={stat.label} />,
                                    overdue ? (
                                        <Tag key="o" tone="rose">
                                            SLA terlewat
                                        </Tag>
                                    ) : null,
                                ].filter(Boolean)}
                            />
                        )
                    }}
                    renderDetail={(t) => <DetailPane task={t} />}
                />
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
