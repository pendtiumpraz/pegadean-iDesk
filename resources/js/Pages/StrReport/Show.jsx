import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { ArrowLeft, Send } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import RightRail from '@/Components/RightRail'
import AISuggestionCallout from '@/Components/AISuggestionCallout'

const STATUS_LABEL = {
    draft: 'Draft', review: 'Review', submitted: 'Submitted', rejected: 'Rejected',
}
const STATUS_TONE = {
    draft: 'draft', review: 'review', submitted: 'approve', rejected: 'rejected',
}

function fmt(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtDate(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtCurrency(val) {
    if (!val && val !== 0) return '—'
    return Number(val).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
}

export default function StrShow({ str }) {
    function handleSubmit() {
        if (!confirm('Submit STR ini ke PPATK? Tindakan ini tidak dapat dibatalkan.')) return
        router.post(route('str.submit', str?.id))
    }

    return (
        <AppLayout title={`STR — ${str?.nomor_str ?? ''}`}>
            <PageHeader
                title={str?.nomor_str ?? 'Detail STR'}
                description="Suspicious Transaction Report"
                breadcrumbs={[
                    { label: 'STR', href: route('str.index') },
                    { label: str?.nomor_str ?? 'Detail' },
                ]}
                actions={
                    <>
                        <Link href={route('str.index')} className="btn ghost">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                        {str?.status === 'review' && (
                            <button onClick={handleSubmit} className="btn primary">
                                <Send size={14} /> Submit ke PPATK
                            </button>
                        )}
                    </>
                }
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <Badge status={STATUS_TONE[str?.status] ?? 'draft'} label={STATUS_LABEL[str?.status] ?? str?.status} />
                {str?.submitted_at && (
                    <span style={{ fontSize: 12.5, color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace' }}>
                        Disubmit {fmt(str.submitted_at)}
                    </span>
                )}
            </div>

            <RightRail
                main={
                    <>
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Detail Transaksi</h3>
                                    <div className="sub">Informasi transaksi yang dilaporkan</div>
                                </div>
                            </div>
                            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Jumlah Transaksi</div>
                                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 600, color: 'var(--ink-900)', marginTop: 4 }}>
                                        {fmtCurrency(str?.jumlah_transaksi)}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Tanggal Transaksi</div>
                                    <div style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, color: 'var(--ink-900)', marginTop: 4 }}>
                                        {fmtDate(str?.tanggal_transaksi)}
                                    </div>
                                </div>
                            </div>

                            {str?.deskripsi && (
                                <div className="card-body" style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 14 }}>
                                    <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>Deskripsi Transaksi</div>
                                    <p style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-900)', margin: 0 }}>
                                        {str.deskripsi}
                                    </p>
                                </div>
                            )}
                        </div>

                        {str?.indikasi && (
                            <AISuggestionCallout
                                title="Indikasi Pencucian Uang"
                                body={str.indikasi}
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {str?.status === 'review' && (
                            <div className="card">
                                <div className="card-head">
                                    <div>
                                        <h3>Tindakan</h3>
                                        <div className="sub">STR siap disubmit ke PPATK</div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p style={{ fontSize: 13, color: 'var(--ink-700)', marginBottom: 12 }}>
                                        Setelah disubmit, laporan STR akan diteruskan ke PPATK dan tidak dapat ditarik kembali.
                                        Pastikan semua informasi sudah lengkap dan akurat.
                                    </p>
                                    <button onClick={handleSubmit} className="btn primary">
                                        <Send size={14} /> Submit ke PPATK
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                }
                rail={
                    <div className="card">
                        <div className="card-head">
                            <div>
                                <h3>Informasi Nasabah</h3>
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                            {[
                                ['Nomor STR', <span className="doc-id">{str?.nomor_str ?? '—'}</span>],
                                ['Nama Nasabah', str?.nasabah_nama ?? '—'],
                                ['NIK', <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{str?.nasabah_nik ?? '—'}</span>],
                                ['Referensi Nasabah', <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{str?.nasabah_ref ?? '—'}</span>],
                                ['Status', <Badge status={STATUS_TONE[str?.status] ?? 'draft'} label={STATUS_LABEL[str?.status] ?? str?.status} />],
                                ['Dibuat', fmt(str?.created_at)],
                                str?.reviewer_id ? ['Reviewer ID', str.reviewer_id] : null,
                            ].filter(Boolean).map(([k, v], i, arr) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: i < arr.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                                    <span style={{ color: 'var(--ink-500)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{k}</span>
                                    <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            />
        </AppLayout>
    )
}
