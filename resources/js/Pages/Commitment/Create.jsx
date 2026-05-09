import { useForm, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { ArrowLeft, Save } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'

const inputBase = {
    width: '100%', background: 'var(--paper)', border: '1px solid var(--ink-200)',
    borderRadius: 8, color: 'var(--ink-900)', padding: '8px 12px',
    fontSize: 13.5, outline: 'none', boxSizing: 'border-box',
}
const inputErr = { borderColor: 'var(--rose-600)' }

function Field({ label, error, required, children, colSpan }) {
    return (
        <div style={colSpan ? { gridColumn: `span ${colSpan}` } : null}>
            <div style={{
                fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase',
                letterSpacing: '.06em', fontWeight: 600, marginBottom: 4,
            }}>
                {label}{required && <span style={{ color: 'var(--rose-600)' }}> *</span>}
            </div>
            {children}
            {error && <p style={{ fontSize: 11.5, color: 'var(--rose-600)', marginTop: 4 }}>{error}</p>}
        </div>
    )
}

export default function KomitmenCreate({ users = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        judul:        '',
        deskripsi:    '',
        jenis:        '',
        deadline:     '',
        status:       'open',
        pic_user_id:  '',
        progress_pct: 0,
        catatan:      '',
    })

    function submit(e) {
        e.preventDefault()
        post(route('commitments.store'))
    }

    const progressColor = data.progress_pct >= 100 ? 'var(--brand-600)' : data.progress_pct >= 60 ? 'var(--info-600)' : data.progress_pct >= 30 ? 'var(--gold-500)' : 'var(--amber-600)'

    return (
        <AppLayout title="Tambah Komitmen">
            <PageHeader
                title="Tambah Komitmen"
                description="Daftarkan komitmen atau kewajiban kepatuhan baru."
                breadcrumbs={[
                    { label: 'Komitmen', href: route('commitments.index') },
                    { label: 'Tambah' },
                ]}
                actions={
                    <Link href={route('commitments.index')} className="btn ghost">
                        <ArrowLeft size={14} /> Kembali
                    </Link>
                }
            />

            <form onSubmit={submit}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Informasi Komitmen</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Judul Komitmen" error={errors.judul} required colSpan={2}>
                            <input
                                style={{ ...inputBase, ...(errors.judul ? inputErr : {}) }}
                                value={data.judul}
                                onChange={e => setData('judul', e.target.value)}
                                placeholder="contoh: Penyelesaian temuan audit Q1 2026"
                            />
                        </Field>

                        <Field label="Jenis" error={errors.jenis} required>
                            <select
                                style={{ ...inputBase, ...(errors.jenis ? inputErr : {}) }}
                                value={data.jenis}
                                onChange={e => setData('jenis', e.target.value)}
                            >
                                <option value="">— Pilih Jenis —</option>
                                <option value="regulasi">Regulasi</option>
                                <option value="internal">Internal</option>
                                <option value="audit">Audit</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </Field>

                        <Field label="Status" error={errors.status} required>
                            <select
                                style={{ ...inputBase, ...(errors.status ? inputErr : {}) }}
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </Field>

                        <Field label="Deadline" error={errors.deadline} required>
                            <input
                                type="date"
                                style={{ ...inputBase, ...(errors.deadline ? inputErr : {}) }}
                                value={data.deadline}
                                onChange={e => setData('deadline', e.target.value)}
                            />
                        </Field>

                        <Field label="PIC" error={errors.pic_user_id}>
                            {users.length > 0 ? (
                                <select
                                    style={{ ...inputBase, ...(errors.pic_user_id ? inputErr : {}) }}
                                    value={data.pic_user_id}
                                    onChange={e => setData('pic_user_id', e.target.value)}
                                >
                                    <option value="">— Pilih PIC —</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            ) : (
                                <input
                                    style={{ ...inputBase, ...(errors.pic_user_id ? inputErr : {}) }}
                                    value={data.pic_user_id}
                                    onChange={e => setData('pic_user_id', e.target.value)}
                                    placeholder="ID pengguna penanggung jawab"
                                />
                            )}
                        </Field>

                        <Field label={`Progress: ${data.progress_pct}%`} error={errors.progress_pct} colSpan={2}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <input
                                    type="range"
                                    min="0" max="100" step="5"
                                    value={data.progress_pct}
                                    onChange={e => setData('progress_pct', Number(e.target.value))}
                                    style={{ flex: 1, accentColor: progressColor }}
                                />
                                <input
                                    type="number"
                                    min="0" max="100"
                                    value={data.progress_pct}
                                    onChange={e => setData('progress_pct', Math.min(100, Math.max(0, Number(e.target.value))))}
                                    style={{ ...inputBase, width: 80, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}
                                />
                            </div>
                        </Field>

                        <Field label="Deskripsi" error={errors.deskripsi} colSpan={2}>
                            <textarea
                                rows={3}
                                style={{ ...inputBase, resize: 'vertical', fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 14, lineHeight: 1.6, ...(errors.deskripsi ? inputErr : {}) }}
                                value={data.deskripsi}
                                onChange={e => setData('deskripsi', e.target.value)}
                                placeholder="Uraian lengkap komitmen…"
                            />
                        </Field>

                        <Field label="Catatan" error={errors.catatan} colSpan={2}>
                            <textarea
                                rows={3}
                                style={{ ...inputBase, resize: 'vertical', ...(errors.catatan ? inputErr : {}) }}
                                value={data.catatan}
                                onChange={e => setData('catatan', e.target.value)}
                                placeholder="Catatan tambahan atau tindak lanjut…"
                            />
                        </Field>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--ink-200)' }}>
                        <Link href={route('commitments.index')} className="btn ghost">Batal</Link>
                        <button type="submit" disabled={processing} className="btn primary">
                            <Save size={14} /> {processing ? 'Menyimpan…' : 'Simpan Komitmen'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    )
}
