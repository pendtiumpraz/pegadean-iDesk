import { useForm, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Check,
    X,
    Send,
    HelpCircle,
    Eye,
    Download,
    ArrowLeft,
    Link2,
    MoreHorizontal,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
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

/* ───────── page ───────── */
export default function TugasReviewShow({ task, document }) {
    const form = useForm({ catatan: task?.catatan ?? '' })
    const stat = statusOf(task)
    const overdue = stat.tone === 'rejected'
    const sla = slaText(task?.deadline)

    const fromName = task?.dari_user_name ?? task?.dari_user?.name ?? task?.assigned_by ?? 'Sistem'
    const fromRole = task?.dari_user_role ?? task?.dari_user?.role ?? null
    const fromEmail = task?.dari_user?.email ?? null

    const docTitle = document?.judul ?? task?.serkep?.title ?? task?.policy?.judul ?? task?.judul_review
    const docNumber = document?.nomor_kebijakan ?? document?.nomor_serkep ?? task?.serkep?.nomor ?? task?.policy?.nomor_kebijakan
    const docRoute =
        task?.jenis_dokumen === 'policy' && task?.policy_id
            ? route('policies.show', task.policy_id)
            : task?.serkep_id
              ? route('serkep.show', task.serkep_id)
              : null

    function handleComplete(e) {
        e?.preventDefault()
        if (!confirm('Tandai tugas review ini sebagai selesai?')) return
        form.put(route('reviews.complete', task.id))
    }

    return (
        <AppLayout title={`Tugas Review — ${task?.judul_review ?? ''}`}>
            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda' },
                    { label: 'Tugas Review', href: route('reviews.index') },
                    { label: task?.judul_review ?? 'Detail' },
                ]}
                title={task?.judul_review ?? 'Detail Tugas Review'}
                description={`${JENIS_LABEL[task?.jenis_dokumen] ?? task?.jenis_dokumen ?? '—'} · ${docNumber ?? '—'}`}
                actions={
                    <Link href={route('reviews.index')} className="btn ghost">
                        <ArrowLeft size={14} /> Kembali
                    </Link>
                }
            />

            <div className="card" style={{ padding: 24 }}>
                {/* avatar header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Avatar name={fromName} size={42} tone="brand" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{fromName}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                            {fromRole ? `${fromRole} · ` : ''}
                            {fromEmail ? `${fromEmail} · ` : ''}
                            {fmtRelative(task?.created_at)}
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

                {/* serif h2 title */}
                <h2
                    style={{
                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                        fontWeight: 500,
                        fontSize: 24,
                        margin: '0 0 8px',
                        letterSpacing: '-.3px',
                    }}
                >
                    {task?.judul_review}
                </h2>

                {/* pill row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <Badge status={stat.tone} label={stat.label} />
                    {task?.jenis_dokumen && (
                        <Tag tone="brand">
                            {JENIS_LABEL[task.jenis_dokumen] ?? task.jenis_dokumen}
                        </Tag>
                    )}
                    {docNumber && <Tag>{docNumber}</Tag>}
                    {sla && <Tag tone={sla.overdue ? 'rose' : 'neutral'}>{sla.label}</Tag>}
                    {task?.deadline && (
                        <span style={{ fontSize: 12, color: 'var(--ink-500)', alignSelf: 'center' }}>
                            Deadline: {task.deadline}
                        </span>
                    )}
                </div>

                {/* serif body */}
                <div
                    style={{
                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: 'var(--ink-700)',
                    }}
                >
                    {task?.catatan ? (
                        <p style={{ margin: '0 0 12px' }}>{task.catatan}</p>
                    ) : (
                        <p style={{ margin: '0 0 12px', color: 'var(--ink-500)' }}>
                            Tidak ada catatan tambahan untuk tugas review ini. Silakan periksa
                            dokumen terkait dan berikan tanggapan Anda.
                        </p>
                    )}
                    {docTitle && (
                        <p style={{ margin: 0 }}>
                            Dokumen yang ditinjau: <b>{docTitle}</b>
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

                {/* PDF attachment */}
                {(task?.serkep_id || task?.policy_id || docTitle) && (
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
                                    {docNumber ?? `Tugas-${task?.id}`}_{(docTitle ?? 'review').replace(/\s+/g, '-')}.pdf
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                                    {task?.jenis_dokumen
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

                {/* completion form */}
                {task?.status !== 'completed' && task?.status !== 'selesai' && (
                    <form onSubmit={handleComplete} style={{ marginTop: 24 }}>
                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    fontSize: 12,
                                    color: 'var(--ink-500)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '.04em',
                                    display: 'block',
                                    marginBottom: 6,
                                }}
                            >
                                Catatan Balasan
                            </label>
                            <textarea
                                rows={4}
                                value={form.data.catatan}
                                onChange={(e) => form.setData('catatan', e.target.value)}
                                placeholder="Tuliskan catatan, hasil review, atau tanggapan…"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid var(--ink-200)',
                                    background: 'var(--paper, #fff)',
                                    color: 'var(--ink-900)',
                                    fontSize: 14,
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                }}
                            />
                            {form.errors.catatan && (
                                <p style={{ fontSize: 12, color: 'var(--rose-600)', marginTop: 4 }}>
                                    {form.errors.catatan}
                                </p>
                            )}
                        </div>

                        {/* footer 4-button row */}
                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
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
                            <button type="submit" className="btn primary" disabled={form.processing}>
                                <Check size={14} />{' '}
                                {form.processing ? 'Menyimpan…' : 'Selesaikan'}
                            </button>
                        </div>
                    </form>
                )}

                {/* completed state */}
                {(task?.status === 'completed' || task?.status === 'selesai') && (
                    <div
                        style={{
                            marginTop: 24,
                            padding: '12px 14px',
                            background: 'var(--brand-50)',
                            border: '1px solid var(--brand-100)',
                            borderRadius: 8,
                            fontSize: 13,
                            color: 'var(--brand-700)',
                        }}
                    >
                        Tugas review ini telah diselesaikan
                        {task?.completed_at ? ` pada ${task.completed_at}` : ''}.
                    </div>
                )}

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
                        Tugas ini telah melewati batas deadline {task?.deadline}.
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
