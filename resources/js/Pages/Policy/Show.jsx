import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import { Pencil, Bot, Link2, History, Download, BookOpen } from 'lucide-react'

const TYPE_TONE = {
    induk:     { tone: 'brand', label: 'Induk' },
    anak:      { tone: 'info',  label: 'Anak' },
    eksternal: { tone: 'gold',  label: 'Eksternal' },
}

const DEFAULT_TOC = [
    'Ketentuan Umum',
    'Ruang Lingkup',
    'Definisi',
    'Prinsip Dasar',
    'Pelaksanaan',
    'Pemantauan & Evaluasi',
    'Pelaporan',
    'Sanksi',
    'Ketentuan Peralihan',
    'Penutup',
]

export default function KebijakanShow({ policy }) {
    const typeKey = (policy?.type ?? '').toLowerCase()
    const typeMeta = TYPE_TONE[typeKey]

    function handleAiReview() {
        if (!confirm('Jalankan AI Review untuk kebijakan ini?')) return
        router.post(route('policies.ai-review', policy.id))
    }

    function handleCopyLink() {
        const url = window.location.href
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url)
        }
    }

    const linkedSerkeps = policy?.serkeps ?? []

    return (
        <AppLayout title={`Kebijakan — ${policy?.code ?? ''}`}>
            <PageHeader
                title={policy?.title ?? 'Detail Kebijakan'}
                description={
                    <span style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {typeMeta && <Tag tone={typeMeta.tone}>{typeMeta.label}</Tag>}
                        {policy?.category && <Tag>{policy.category}</Tag>}
                        {policy?.version && <span>v{policy.version}</span>}
                        {policy?.effective_date && <span>· Berlaku sejak {policy.effective_date}</span>}
                        {policy?.status && <Badge status={policy.status} />}
                    </span>
                }
                breadcrumbs={[
                    { label: 'Repository', href: route('policies.index') },
                    { label: policy?.code ?? 'Detail' },
                ]}
                actions={
                    <>
                        <Link href={route('policies.edit', policy?.id)} className="btn ghost">
                            <Pencil size={14} /> Edit
                        </Link>
                        <button type="button" onClick={handleAiReview} className="btn ghost">
                            <Bot size={14} /> AI Review
                        </button>
                        <button type="button" onClick={handleCopyLink} className="btn ghost">
                            <Link2 size={14} /> Salin Tautan
                        </button>
                        <button type="button" className="btn ghost">
                            <History size={14} /> Riwayat Versi
                        </button>
                    </>
                }
            />

            <div className="three-col">
                {/* LEFT — Ringkasan / Kutipan / TOC */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-head">
                        <div>
                            <h3>Ringkasan & Kutipan Pasal</h3>
                            <div className="sub">Lihat dokumen lengkap untuk seluruh isi kebijakan</div>
                        </div>
                        {policy?.file_path && (
                            <a
                                href={`/storage/${policy.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn ghost sm"
                            >
                                <Download size={13} /> Buka dokumen lengkap
                            </a>
                        )}
                    </div>
                    <div className="card-body">
                        <div
                            style={{
                                fontFamily: "'IBM Plex Serif', Georgia, serif",
                                fontSize: 15,
                                lineHeight: 1.7,
                                color: 'var(--ink-900)',
                                marginBottom: 24,
                            }}
                        >
                            {policy?.summary ?? <span style={{ color: 'var(--ink-500)' }}>Ringkasan belum tersedia.</span>}
                        </div>

                        {policy?.excerpt && (
                            <div
                                style={{
                                    background: 'var(--ink-50)',
                                    borderLeft: '4px solid var(--brand-600)',
                                    padding: '16px 20px',
                                    borderRadius: '0 8px 8px 0',
                                    marginBottom: 20,
                                }}
                            >
                                {policy?.pasal_ref && (
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            letterSpacing: '.08em',
                                            textTransform: 'uppercase',
                                            color: 'var(--brand-700)',
                                            marginBottom: 8,
                                        }}
                                    >
                                        {policy.pasal_ref}
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                                        fontSize: 14.5,
                                        lineHeight: 1.7,
                                        color: 'var(--ink-900)',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    "{policy.excerpt}"
                                </div>
                                {policy?.pasal_ref && (
                                    <div
                                        style={{
                                            fontFamily: 'Inter, system-ui, sans-serif',
                                            fontSize: 11,
                                            color: 'var(--ink-500)',
                                            marginTop: 6,
                                            fontWeight: 500,
                                        }}
                                    >
                                        — {policy.code} {policy.pasal_ref}
                                    </div>
                                )}
                            </div>
                        )}

                        <h4
                            style={{
                                marginTop: 24,
                                marginBottom: 8,
                                fontFamily: "'IBM Plex Serif', Georgia, serif",
                                fontWeight: 500,
                            }}
                        >
                            Daftar Isi
                        </h4>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 4,
                                fontSize: 13,
                            }}
                        >
                            {DEFAULT_TOC.map((s, i) => (
                                <a
                                    key={i}
                                    href={`#bab-${i + 1}`}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: 6,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer',
                                        color: 'var(--ink-900)',
                                        textDecoration: 'none',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-50)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <span
                                        className="mono"
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--ink-500)',
                                            minWidth: 28,
                                        }}
                                    >
                                        §{i + 1}
                                    </span>
                                    <span>{s}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — Metadata + Tertaut */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-head"><h3>Metadata</h3></div>
                        <div className="card-body" style={{ fontSize: 13 }}>
                            {[
                                ['Kode',           policy?.code,           true],
                                ['Tipe',           typeMeta?.label ?? policy?.type, false],
                                ['Kategori',       policy?.category,       false],
                                ['Versi',          policy?.version,        false],
                                ['Tanggal Berlaku', policy?.effective_date, false],
                                ['Status',         policy?.status,         false],
                                ['Pemilik',        policy?.owner_div ?? '—', false],
                                ['Pengesah',       policy?.pengesah ?? '—', false],
                            ].map(([l, v, mono], i, arr) => (
                                <div
                                    key={l}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '8px 0',
                                        borderBottom: i < arr.length - 1 ? '1px solid var(--ink-100)' : 0,
                                        gap: 8,
                                    }}
                                >
                                    <span style={{ color: 'var(--ink-500)' }}>{l}</span>
                                    <span className={mono ? 'doc-id' : ''} style={{ fontWeight: 500, textAlign: 'right' }}>
                                        {v ?? '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head">
                            <h3>Tertaut</h3>
                            <div className="sub">{linkedSerkeps.length} SERKEP merujuk kebijakan ini</div>
                        </div>
                        <div className="card-body" style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {linkedSerkeps.length === 0 ? (
                                <p style={{ color: 'var(--ink-500)' }}>Belum ada SERKEP yang merujuk kebijakan ini.</p>
                            ) : (
                                linkedSerkeps.slice(0, 5).map((sk, i, arr) => (
                                    <Link
                                        key={sk.id}
                                        href={route('serkep.show', sk.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '8px 0',
                                            borderBottom: i < arr.length - 1 ? '1px solid var(--ink-100)' : 0,
                                            textDecoration: 'none',
                                            color: 'var(--ink-900)',
                                        }}
                                    >
                                        <BookOpen size={14} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="doc-id" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>
                                                {sk.nomor}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12.5,
                                                    fontWeight: 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {sk.title}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
