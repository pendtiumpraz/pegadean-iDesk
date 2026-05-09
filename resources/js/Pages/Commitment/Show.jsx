import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { ArrowLeft, Pencil, Save, Clock } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import HBar from '@/Components/HBar'
import RightRail from '@/Components/RightRail'

const JENIS_LABEL = {
    regulasi: 'Regulasi', internal: 'Internal', audit: 'Audit', lainnya: 'Lainnya',
}

const STATUS_LABEL = {
    open: 'Open', in_progress: 'In Progress', completed: 'Completed', overdue: 'Overdue',
}
const STATUS_TONE = {
    open: 'draft', in_progress: 'review', completed: 'approve', overdue: 'rejected',
}

function fmtDate(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtDateTime(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isOverdue(deadline, status) {
    if (!deadline || status === 'completed') return false
    return new Date(deadline) < new Date()
}

export default function KomitmenShow({ commitment, timeline = [] }) {
    const overdue = isOverdue(commitment?.deadline, commitment?.status)
    const tone = overdue ? 'rejected' : (STATUS_TONE[commitment?.status] ?? 'draft')
    const label = overdue ? 'Overdue' : (STATUS_LABEL[commitment?.status] ?? commitment?.status)

    const [progress, setProgress] = useState(commitment?.progress_pct ?? 0)
    const [catatan, setCatatan]   = useState('')
    const [saving, setSaving]     = useState(false)
    const [saved, setSaved]       = useState(false)

    const progressColor = progress >= 100 ? 'var(--brand-600)' : progress >= 60 ? 'var(--info-600)' : progress >= 30 ? 'var(--gold-500)' : 'var(--amber-600)'

    function handleProgressUpdate(e) {
        e.preventDefault()
        setSaving(true)
        router.put(
            route('commitments.update', commitment?.id),
            { progress_pct: progress, catatan },
            {
                preserveState: true,
                onFinish: () => {
                    setSaving(false)
                    setSaved(true)
                    setTimeout(() => setSaved(false), 2500)
                },
            }
        )
    }

    return (
        <AppLayout title={`Komitmen — ${commitment?.judul ?? ''}`}>
            <PageHeader
                title={commitment?.judul ?? 'Detail Komitmen'}
                description={commitment?.jenis ? `Jenis: ${JENIS_LABEL[commitment.jenis] ?? commitment.jenis}` : undefined}
                breadcrumbs={[
                    { label: 'Komitmen', href: route('commitments.index') },
                    { label: commitment?.judul ?? 'Detail' },
                ]}
                actions={
                    <>
                        <Link href={route('commitments.index')} className="btn ghost">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                        <Link href={route('commitments.edit', commitment?.id)} className="btn primary">
                            <Pencil size={14} /> Edit
                        </Link>
                    </>
                }
            />

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <Badge status={tone} label={label} />
                {commitment?.jenis && <Tag tone={commitment.jenis === 'regulasi' ? 'brand' : commitment.jenis === 'audit' ? 'gold' : 'info'}>{JENIS_LABEL[commitment.jenis] ?? commitment.jenis}</Tag>}
            </div>

            <RightRail
                main={
                    <>
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Detail Komitmen</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <h2 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 22, fontWeight: 500, lineHeight: 1.3, margin: '0 0 12px' }}>
                                    {commitment?.judul ?? '—'}
                                </h2>
                                {commitment?.deskripsi && (
                                    <p style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-700)', margin: 0 }}>
                                        {commitment.deskripsi}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Progress Penyelesaian</h3>
                                    <div className="sub">Perbarui status pengerjaan</div>
                                </div>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 18, color: progressColor }}>
                                    {progress}%
                                </span>
                            </div>
                            <div className="card-body">
                                <HBar value={progress} valueLabel={`${progress}%`} color={progressColor} height={10} style={{ marginBottom: 16 }} />

                                <form onSubmit={handleProgressUpdate}>
                                    <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 14 }}>
                                        <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 8 }}>
                                            Perbarui Progress
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                            <input
                                                type="range"
                                                min="0" max="100" step="5"
                                                value={progress}
                                                onChange={e => setProgress(Number(e.target.value))}
                                                style={{ flex: 1, accentColor: 'var(--brand-600)' }}
                                            />
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={progress}
                                                onChange={e => setProgress(Math.min(100, Math.max(0, Number(e.target.value))))}
                                                style={{
                                                    width: 80, padding: '6px 10px', border: '1px solid var(--ink-200)',
                                                    borderRadius: 6, background: 'var(--paper)', fontSize: 13.5,
                                                    fontFamily: 'JetBrains Mono, monospace', textAlign: 'center',
                                                }}
                                            />
                                        </div>

                                        <textarea
                                            rows={3}
                                            placeholder="Catatan pembaruan progress…"
                                            value={catatan}
                                            onChange={e => setCatatan(e.target.value)}
                                            style={{
                                                width: '100%', padding: '8px 12px',
                                                border: '1px solid var(--ink-200)', borderRadius: 8,
                                                background: 'var(--paper)', fontSize: 13.5,
                                                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                                            }}
                                        />

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                                            {saved && <span style={{ fontSize: 12.5, color: 'var(--brand-700)' }}>Tersimpan!</span>}
                                            <button type="submit" disabled={saving} className="btn primary" style={{ marginLeft: 'auto' }}>
                                                <Save size={14} /> {saving ? 'Menyimpan…' : 'Simpan Progress'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {timeline.length > 0 && (
                            <div className="card">
                                <div className="card-head">
                                    <div>
                                        <h3>Riwayat Pembaruan</h3>
                                        <div className="sub">{timeline.length} perubahan tercatat</div>
                                    </div>
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {timeline.map((t, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < timeline.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                                            <Clock size={14} style={{ color: 'var(--ink-500)', flex: 'none', marginTop: 3 }} />
                                            <div style={{ flex: 1, fontSize: 13 }}>
                                                <div style={{ fontWeight: 600 }}>{t.title ?? `Progress diperbarui ke ${t.progress_pct}%`}</div>
                                                {t.note && <div style={{ color: 'var(--ink-700)', marginTop: 2 }}>{t.note}</div>}
                                                <div style={{ color: 'var(--ink-500)', fontSize: 11.5, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{fmtDateTime(t.at)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                }
                rail={
                    <>
                        <div className="card">
                            <div className="card-head">
                                <div>
                                    <h3>Detail</h3>
                                </div>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                                {[
                                    ['Status', <Badge status={tone} label={label} />],
                                    ['Jenis',  JENIS_LABEL[commitment?.jenis] ?? commitment?.jenis ?? '—'],
                                    ['Deadline', <span style={{ color: overdue ? 'var(--rose-600)' : 'var(--ink-900)', fontWeight: overdue ? 600 : 500 }}>{fmtDate(commitment?.deadline)}</span>],
                                    ['PIC',    commitment?.pic_name ?? commitment?.pic_user_id ?? '—'],
                                    ['Dibuat', fmtDate(commitment?.created_at)],
                                ].map(([k, v], i, arr) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: i < arr.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                                        <span style={{ color: 'var(--ink-500)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{k}</span>
                                        <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {commitment?.catatan && (
                            <div className="card">
                                <div className="card-head">
                                    <div>
                                        <h3>Catatan Terakhir</h3>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-700)', margin: 0 }}>{commitment.catatan}</p>
                                </div>
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    )
}
