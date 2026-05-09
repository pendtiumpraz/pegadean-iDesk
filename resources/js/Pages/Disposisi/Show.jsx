import { useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    ArrowLeft,
    Check,
    CheckCircle,
    Send,
    Eye,
    Download,
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
function fmtDate(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
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

function statusOf(disp) {
    const map = {
        unread:    { tone: 'rejected',   label: 'Belum Dibaca' },
        read:      { tone: 'kajian',     label: 'Sudah Dibaca' },
        completed: { tone: 'approve',    label: 'Selesai' },
    }
    return map[disp?.status] ?? { tone: 'pending', label: disp?.status ?? '—' }
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

const SERKEP_JENIS_LABEL = {
    surat_edaran:    'Surat Edaran',
    surat_keputusan: 'Surat Keputusan',
    instruksi:       'Instruksi',
    memo:            'Memo',
}

/* ───────── page ───────── */
export default function DisposisiShow({ disposisi: disp }) {
    const stat = statusOf(disp)
    const sla = slaText(disp?.sla_due_at ?? disp?.deadline)

    const fromName = disp?.from_user?.name ?? disp?.dari_user?.name ?? disp?.dari_user_name ?? `User #${disp?.from_user_id ?? disp?.dari_user_id ?? '—'}`
    const fromEmail = disp?.from_user?.email ?? disp?.dari_user?.email ?? null
    const fromRole = disp?.from_user?.role ?? disp?.dari_user_role ?? null

    const toName = disp?.to_user?.name ?? disp?.kepada_user?.name ?? disp?.kepada_user_name ?? `User #${disp?.to_user_id ?? disp?.kepada_user_id ?? '—'}`

    const serkepTitle = disp?.serkep?.title ?? disp?.title
    const serkepNumber = disp?.serkep?.nomor
    const serkepJenis = disp?.serkep?.jenis
    const serkepRoute = disp?.serkep_id ? route('serkep.show', disp.serkep_id) : null

    const form = useForm({
        catatan_balasan: disp?.catatan_balasan ?? '',
    })
    const [savedNote, setSavedNote] = useState(false)

    function handleMarkRead() {
        router.put(route('disposisi.read', disp.id))
    }

    function handleComplete(e) {
        e?.preventDefault()
        router.put(
            route('disposisi.read', disp.id),
            { catatan_balasan: form.data.catatan_balasan, status: 'completed' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavedNote(true)
                    setTimeout(() => setSavedNote(false), 2500)
                },
            }
        )
    }

    return (
        <AppLayout title={`Disposisi — ${serkepTitle ?? `#${disp?.id}`}`}>
            <Head title={`Disposisi #${disp?.id} · iDesk`} />

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda' },
                    { label: 'Disposisi', href: route('disposisi.index') },
                    { label: serkepTitle ?? `#${disp?.id ?? 'Detail'}` },
                ]}
                title={`Disposisi #${disp?.id ?? ''}`}
                description={serkepTitle ?? 'Detail disposisi surat'}
                actions={
                    <Link href={route('disposisi.index')} className="btn ghost">
                        <ArrowLeft size={14} /> Kembali
                    </Link>
                }
            />

            <div className="card" style={{ padding: 24 }}>
                {/* avatar header — Dari + Kepada */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Avatar name={fromName} size={42} tone="brand" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>
                            <span>{fromName}</span>
                            <span style={{ color: 'var(--ink-400)', margin: '0 6px', fontWeight: 400 }}>
                                →
                            </span>
                            <span>{toName}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                            {fromRole ? `${fromRole} · ` : ''}
                            {fromEmail ? `${fromEmail} · ` : ''}
                            {fmtDate(disp?.created_at)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {serkepRoute && (
                            <Link href={serkepRoute} className="btn ghost sm">
                                <Link2 size={13} /> Buka SERKEP
                            </Link>
                        )}
                        <button type="button" className="btn ghost sm">
                            <MoreHorizontal size={13} />
                        </button>
                    </div>
                </div>

                {/* serif h2 (linked) */}
                <h2
                    style={{
                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                        fontWeight: 500,
                        fontSize: 24,
                        margin: '0 0 8px',
                        letterSpacing: '-.3px',
                    }}
                >
                    {serkepRoute ? (
                        <Link href={serkepRoute} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {serkepTitle ?? `Disposisi #${disp?.id}`}
                        </Link>
                    ) : (
                        serkepTitle ?? `Disposisi #${disp?.id}`
                    )}
                </h2>

                {/* pill row: SK-id mono Tag, SLA, Tipe */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    <Badge status={stat.tone} label={stat.label} />
                    {serkepNumber && (
                        <Tag
                            tone="ink"
                            style={{
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: 11.5,
                            }}
                        >
                            {serkepNumber}
                        </Tag>
                    )}
                    {serkepJenis && (
                        <Tag tone="brand">
                            {SERKEP_JENIS_LABEL[serkepJenis] ?? serkepJenis}
                        </Tag>
                    )}
                    {sla && <Tag tone={sla.overdue ? 'rose' : 'neutral'}>{sla.label}</Tag>}
                    {disp?.is_urgent && <Tag tone="rose">Urgen</Tag>}
                </div>

                {/* serif body — full instruksi */}
                <div
                    style={{
                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                        fontSize: 15,
                        lineHeight: 1.75,
                        color: 'var(--ink-700)',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {disp?.instruksi ?? disp?.preview ?? 'Tidak ada isi instruksi.'}
                </div>

                {/* AI suggestion */}
                <div style={{ marginTop: 20 }}>
                    <AISuggestionCallout
                        title="Saran AI untuk respons"
                        body="Periksa pasal 12 ayat 3 untuk konsistensi dengan kebijakan induk. Pertimbangkan rujukan ke KIMRK-4.2 sebelum memberikan tanggapan."
                    />
                </div>

                {/* PDF attachment */}
                {disp?.serkep_id && (
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
                                    {serkepNumber ?? `SERKEP-${disp.serkep_id}`}_{(serkepTitle ?? 'dokumen').replace(/\s+/g, '-')}.pdf
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                                    {serkepJenis ? `${SERKEP_JENIS_LABEL[serkepJenis] ?? serkepJenis} · ` : ''}
                                    Dokumen disposisi
                                </div>
                            </div>
                            {serkepRoute && (
                                <Link href={serkepRoute} className="btn ghost sm">
                                    <Eye size={13} /> Buka
                                </Link>
                            )}
                            <button type="button" className="btn ghost sm">
                                <Download size={13} />
                            </button>
                        </div>
                    </div>
                )}

                {/* response form */}
                {disp?.status !== 'completed' && (
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
                                value={form.data.catatan_balasan}
                                onChange={(e) =>
                                    form.setData('catatan_balasan', e.target.value)
                                }
                                placeholder="Tuliskan tanggapan atau laporan penyelesaian…"
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
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                paddingTop: 16,
                                borderTop: '1px solid var(--ink-200)',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                            }}
                        >
                            {disp?.status === 'unread' && (
                                <button
                                    type="button"
                                    className="btn ghost"
                                    onClick={handleMarkRead}
                                >
                                    <CheckCircle size={14} /> Tandai Dibaca
                                </button>
                            )}
                            {savedNote && (
                                <span style={{ fontSize: 12.5, color: 'var(--brand-700)' }}>
                                    Tersimpan!
                                </span>
                            )}
                            <div style={{ flex: 1 }} />
                            <button
                                type="submit"
                                className="btn primary"
                                disabled={form.processing}
                            >
                                <Send size={14} />{' '}
                                {form.processing ? 'Mengirim…' : 'Selesaikan'}
                            </button>
                        </div>
                    </form>
                )}

                {disp?.status === 'completed' && (
                    <>
                        {disp?.catatan_balasan && (
                            <div style={{ marginTop: 24 }}>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: 'var(--ink-500)',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '.04em',
                                        marginBottom: 6,
                                    }}
                                >
                                    Catatan Balasan
                                </div>
                                <div
                                    style={{
                                        padding: 12,
                                        background: 'var(--ink-50)',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        lineHeight: 1.65,
                                        color: 'var(--ink-700)',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {disp.catatan_balasan}
                                </div>
                            </div>
                        )}

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
                            <Check
                                size={14}
                                style={{
                                    display: 'inline',
                                    verticalAlign: 'middle',
                                    marginRight: 6,
                                }}
                            />
                            Disposisi telah ditandai selesai
                            {disp?.read_at ? ` · Dibaca ${fmtRelative(disp.read_at)}` : ''}.
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    )
}
