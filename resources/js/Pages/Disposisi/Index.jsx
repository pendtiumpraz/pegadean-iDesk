import { useMemo, useState } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    RefreshCw,
    Check,
    Send,
    Eye,
    Download,
    Link2,
    MoreHorizontal,
    CheckCircle,
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

function truncate(text, n = 80) {
    if (!text) return ''
    return text.length > n ? text.slice(0, n) + '…' : text
}

function statusOf(disp) {
    const map = {
        unread:    { tone: 'rejected',   label: 'Belum Dibaca' },
        read:      { tone: 'kajian',     label: 'Sudah Dibaca' },
        completed: { tone: 'approve',    label: 'Selesai' },
    }
    return map[disp?.status] ?? { tone: 'pending', label: disp?.status ?? '—' }
}

const SERKEP_JENIS_LABEL = {
    surat_edaran:    'Surat Edaran',
    surat_keputusan: 'Surat Keputusan',
    instruksi:       'Instruksi',
    memo:            'Memo',
}

/* ───────── chip filter ───────── */
const CHIPS = [
    { value: 'masuk',     label: 'Masuk' },
    { value: 'terkirim',  label: 'Terkirim' },
    { value: 'completed', label: 'Selesai' },
]

/* ───────── detail pane ───────── */
function DetailPane({ disp }) {
    const stat = statusOf(disp)
    const fromName = disp?.from_user?.name ?? disp?.dari_user?.name ?? disp?.dari_user_name ?? `User #${disp?.from_user_id ?? disp?.dari_user_id ?? '—'}`
    const toName = disp?.to_user?.name ?? disp?.kepada_user?.name ?? disp?.kepada_user_name ?? `User #${disp?.to_user_id ?? disp?.kepada_user_id ?? '—'}`

    const serkepTitle = disp?.serkep?.title ?? disp?.title
    const serkepNumber = disp?.serkep?.nomor
    const serkepJenis = disp?.serkep?.jenis
    const serkepRoute = disp?.serkep_id ? route('serkep.show', disp.serkep_id) : null

    const form = useForm({
        catatan_balasan: disp?.catatan_balasan ?? '',
    })

    function handleMarkRead() {
        router.put(route('disposisi.read', disp.id))
    }

    function handleSubmit(e) {
        e.preventDefault()
        // Existing controller does not accept update; fall back to mark read + show update
        router.put(
            route('disposisi.read', disp.id),
            { catatan_balasan: form.data.catatan_balasan, status: 'completed' },
            { preserveScroll: true }
        )
    }

    return (
        <>
            {/* avatar header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar name={fromName} size={42} tone="brand" />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>
                        {fromName} <span style={{ color: 'var(--ink-400)', fontWeight: 400 }}>→</span>{' '}
                        {toName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>
                        {fmtRelative(disp?.created_at)}
                        {disp?.read_at && ` · Dibaca ${fmtRelative(disp.read_at)}`}
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

            {/* serif h2 title */}
            <h2
                style={{
                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                    fontWeight: 500,
                    fontSize: 22,
                    margin: '0 0 8px',
                    letterSpacing: '-.3px',
                }}
            >
                {serkepRoute ? (
                    <Link href={serkepRoute} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {serkepTitle ?? `Disposisi #${disp.id}`}
                    </Link>
                ) : (
                    serkepTitle ?? `Disposisi #${disp.id}`
                )}
            </h2>

            {/* pill row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={stat.tone} label={stat.label} />
                {serkepNumber && (
                    <Tag tone="ink" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>
                        {serkepNumber}
                    </Tag>
                )}
                {serkepJenis && <Tag tone="brand">{SERKEP_JENIS_LABEL[serkepJenis] ?? serkepJenis}</Tag>}
                {disp?.is_urgent && <Tag tone="rose">Urgen</Tag>}
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
                <p style={{ margin: '0 0 12px' }}>
                    {disp?.instruksi ?? disp?.preview ?? 'Tidak ada isi instruksi.'}
                </p>
            </div>

            {/* AI suggestion */}
            <div style={{ marginTop: 20 }}>
                <AISuggestionCallout
                    title="Saran AI untuk respons"
                    body="Periksa pasal 12 ayat 3 untuk konsistensi dengan kebijakan induk. Pertimbangkan rujukan ke KIMRK-4.2 sebelum memberikan tanggapan."
                />
            </div>

            {/* PDF attachment from serkep */}
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
                <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
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
                            rows={3}
                            value={form.data.catatan_balasan}
                            onChange={(e) => form.setData('catatan_balasan', e.target.value)}
                            placeholder="Tuliskan tanggapan atau laporan…"
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
                        }}
                    >
                        {disp?.status === 'unread' && (
                            <button type="button" className="btn ghost" onClick={handleMarkRead}>
                                <CheckCircle size={14} /> Tandai Dibaca
                            </button>
                        )}
                        <Link href={route('disposisi.show', disp.id)} className="btn ghost">
                            <Eye size={14} /> Detail
                        </Link>
                        <div style={{ flex: 1 }} />
                        <button type="submit" className="btn primary" disabled={form.processing}>
                            <Send size={14} />{' '}
                            {form.processing ? 'Mengirim…' : 'Selesaikan'}
                        </button>
                    </div>
                </form>
            )}

            {disp?.status === 'completed' && (
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
                        style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}
                    />
                    Disposisi ini telah ditandai selesai.
                </div>
            )}
        </>
    )
}

/* ───────── page ───────── */
export default function DisposisiIndex({ disposisis, disposisi, filters }) {
    // Controller currently passes `disposisis`; we accept `disposisi` as fallback
    const paginated = disposisis ?? disposisi ?? {}
    const { data = [], links = [], meta = {} } = paginated
    const [activeChip, setActiveChip] = useState(filters?.tab ?? 'masuk')
    const [selectedId, setSelectedId] = useState(() => data[0]?.id)

    const chips = useMemo(() => {
        const counts = data.reduce(
            (acc, d) => {
                if (d.status === 'completed') acc.completed++
                else acc.masuk++
                return acc
            },
            { masuk: 0, terkirim: 0, completed: 0 }
        )
        return CHIPS.map((c) => ({
            ...c,
            count:
                c.value === 'masuk'     ? counts.masuk     :
                c.value === 'terkirim'  ? counts.terkirim  :
                c.value === 'completed' ? counts.completed :
                undefined,
        }))
    }, [data])

    function handleChip(value) {
        setActiveChip(value)
    }

    const filtered = useMemo(() => {
        if (activeChip === 'completed') return data.filter((d) => d.status === 'completed')
        if (activeChip === 'terkirim')  return data.filter((d) => d.is_outgoing)
        return data.filter((d) => d.status !== 'completed')
    }, [data, activeChip])

    function handleRefresh() {
        router.reload({ only: ['disposisis'] })
    }

    return (
        <AppLayout title="Disposisi">
            <Head title="Disposisi · iDesk" />

            <PageHeader
                breadcrumbs={[{ label: 'Beranda' }, { label: 'Disposisi & Persetujuan' }]}
                title="Disposisi"
                description={`${meta?.total ?? data.length} disposisi · kelola alur disposisi dan persetujuan dokumen.`}
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
                    Tidak ada disposisi.
                </div>
            ) : (
                <Inbox
                    items={filtered}
                    selectedId={selectedId}
                    onSelect={(id) => setSelectedId(id)}
                    getItemId={(item, i) => item.id ?? i}
                    chips={chips}
                    activeChip={activeChip}
                    onChipSelect={handleChip}
                    renderItem={(d) => {
                        const stat = statusOf(d)
                        const fromName =
                            d.from_user?.name ?? d.dari_user?.name ?? d.dari_user_name ?? `User #${d.from_user_id ?? d.dari_user_id ?? '—'}`
                        const serkepTitle = d.serkep?.title ?? d.title ?? `Disposisi #${d.id}`
                        const jenis = d.serkep?.jenis
                        return (
                            <InboxItem
                                from={fromName}
                                time={fmtRelative(d.created_at)}
                                title={serkepTitle}
                                preview={truncate(d.instruksi ?? d.preview, 80)}
                                unread={d.status === 'unread'}
                                tags={[
                                    <Badge key="s" status={stat.tone} label={stat.label} />,
                                    jenis ? (
                                        <Tag key="j" tone="brand">
                                            {SERKEP_JENIS_LABEL[jenis] ?? jenis}
                                        </Tag>
                                    ) : null,
                                    d.is_urgent ? (
                                        <Tag key="u" tone="rose">
                                            Urgen
                                        </Tag>
                                    ) : null,
                                ].filter(Boolean)}
                            />
                        )
                    }}
                    renderDetail={(d) => <DetailPane disp={d} />}
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
