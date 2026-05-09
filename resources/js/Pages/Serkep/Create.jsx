import { useRef } from 'react'
import { useForm, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import AISuggestionCallout from '@/Components/AISuggestionCallout'
import { Upload, FileText } from 'lucide-react'

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--ink-200)',
    borderRadius: 6,
    background: 'var(--paper)',
    color: 'var(--ink-900)',
    fontSize: 13,
    boxSizing: 'border-box',
}
const labelStyle = {
    display: 'block',
    fontSize: 11.5,
    color: 'var(--ink-500)',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    fontWeight: 600,
    marginBottom: 4,
}
const errorStyle = { fontSize: 11.5, color: 'var(--rose-600)', marginTop: 4 }
const fieldGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }

function Field({ label, error, children, fullWidth }) {
    return (
        <div style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
            <label style={labelStyle}>{label}</label>
            {children}
            {error && <p style={errorStyle}>{error}</p>}
        </div>
    )
}

export default function SerkepCreate({ parentPolicies = [], replacesOptions = [] }) {
    const fileRef = useRef(null)
    const form = useForm({
        nomor: '',
        title: '',
        jenis_naskah: 'surat_edaran',
        klasifikasi: 'internal',
        status: 'draft',
        pemrakarsa_div: '',
        effective_date: '',
        version: 1,
        page_count: '',
        replaces_id: '',
        sla_due_at: '',
        signer: '',
        draft_file_path: '',
        final_file_path: '',
    })

    function submit(e) {
        e.preventDefault()
        form.post(route('serkep.store'))
    }

    return (
        <AppLayout title="Pengajuan SERKEP">
            <PageHeader
                title="Pengajuan SERKEP Baru"
                description="AI Co-pilot akan menganalisa draft sebelum disampaikan ke KaDep CPP."
                breadcrumbs={[
                    { label: 'Tinjauan Kepatuhan' },
                    { label: 'SERKEP', href: route('serkep.index') },
                    { label: 'Pengajuan' },
                ]}
            />

            <form onSubmit={submit}>
                {/* Identitas Naskah */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <div>
                            <h3>Identitas Naskah</h3>
                            <div className="sub">Jenis, klasifikasi, judul, dan tanggal-tanggal penting.</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div style={fieldGrid}>
                            <Field label="Jenis Naskah *" error={form.errors.jenis_naskah}>
                                <select style={inputStyle} value={form.data.jenis_naskah} onChange={e => form.setData('jenis_naskah', e.target.value)}>
                                    <option value="surat_edaran">SERKEP — Surat Edaran Kepatuhan</option>
                                    <option value="surat_keputusan">SK — Surat Keputusan</option>
                                    <option value="instruksi">Instruksi</option>
                                    <option value="memo">Memo</option>
                                </select>
                            </Field>

                            <Field label="Klasifikasi" error={form.errors.klasifikasi}>
                                <select style={inputStyle} value={form.data.klasifikasi} onChange={e => form.setData('klasifikasi', e.target.value)}>
                                    <option value="internal">Internal</option>
                                    <option value="terbatas">Terbatas</option>
                                    <option value="rahasia">Rahasia</option>
                                </select>
                            </Field>

                            <Field label="Nomor *" error={form.errors.nomor}>
                                <input
                                    type="text"
                                    style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
                                    value={form.data.nomor}
                                    onChange={e => form.setData('nomor', e.target.value)}
                                    placeholder="SK-2026/0431"
                                    required
                                />
                            </Field>

                            <Field label="Status *" error={form.errors.status}>
                                <select style={inputStyle} value={form.data.status} onChange={e => form.setData('status', e.target.value)}>
                                    <option value="draft">Drafting</option>
                                    <option value="review_cpp">Review CPP</option>
                                    <option value="kajian">Kajian</option>
                                    <option value="pengesahan">Pengesahan</option>
                                    <option value="released">Terbit</option>
                                </select>
                            </Field>

                            <Field label="Judul *" error={form.errors.title} fullWidth>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                    placeholder="Contoh: Pedoman Pengelolaan Risiko Operasional Cabang"
                                    required
                                />
                            </Field>

                            <Field label="Divisi Pemrakarsa" error={form.errors.pemrakarsa_div}>
                                <select style={inputStyle} value={form.data.pemrakarsa_div} onChange={e => form.setData('pemrakarsa_div', e.target.value)}>
                                    <option value="">Pilih divisi</option>
                                    <option value="Manajemen Risiko">Manajemen Risiko</option>
                                    <option value="Bisnis Gadai">Bisnis Gadai</option>
                                    <option value="Anti Fraud">Anti Fraud</option>
                                    <option value="Treasury">Treasury</option>
                                    <option value="TI">TI</option>
                                    <option value="SDM">SDM</option>
                                    <option value="Operasional">Operasional</option>
                                    <option value="Kepatuhan">Kepatuhan</option>
                                </select>
                            </Field>

                            <Field label="Tanggal Berlaku Efektif" error={form.errors.effective_date}>
                                <input
                                    type="date"
                                    style={inputStyle}
                                    value={form.data.effective_date}
                                    onChange={e => form.setData('effective_date', e.target.value)}
                                />
                            </Field>

                            <Field label="SLA — Batas Waktu" error={form.errors.sla_due_at}>
                                <input
                                    type="datetime-local"
                                    style={inputStyle}
                                    value={form.data.sla_due_at}
                                    onChange={e => form.setData('sla_due_at', e.target.value)}
                                />
                            </Field>

                            <Field label="Versi" error={form.errors.version}>
                                <input
                                    type="number"
                                    min="1"
                                    style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
                                    value={form.data.version}
                                    onChange={e => form.setData('version', e.target.value ? parseInt(e.target.value, 10) : '')}
                                />
                            </Field>

                            <Field label="Jumlah Halaman" error={form.errors.page_count}>
                                <input
                                    type="number"
                                    min="0"
                                    style={inputStyle}
                                    value={form.data.page_count}
                                    onChange={e => form.setData('page_count', e.target.value ? parseInt(e.target.value, 10) : '')}
                                />
                            </Field>

                            <Field label="Penandatangan / Signer" error={form.errors.signer}>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={form.data.signer}
                                    onChange={e => form.setData('signer', e.target.value)}
                                    placeholder="Direktur Utama / KaDiv Kepatuhan"
                                />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Hierarki */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <div>
                            <h3>Hierarki & Pengganti</h3>
                            <div className="sub">Tautkan ke kebijakan induk dan SERKEP yang digantikan.</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div style={fieldGrid}>
                            <Field label="Kebijakan Induk Terkait" error={form.errors.parent_policies} fullWidth>
                                <div
                                    style={{
                                        display: 'flex', gap: 6, flexWrap: 'wrap',
                                        padding: 8, border: '1px solid var(--ink-200)', borderRadius: 6,
                                        minHeight: 44, background: 'var(--paper)',
                                    }}
                                >
                                    {parentPolicies.length === 0 ? (
                                        <span style={{ color: 'var(--ink-500)', fontSize: 12 }}>
                                            Tag kebijakan induk akan tersedia setelah hubungan kebijakan dimuat.
                                        </span>
                                    ) : (
                                        parentPolicies.slice(0, 3).map(p => (
                                            <span
                                                key={p.id}
                                                className="tag"
                                                style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', padding: '4px 8px' }}
                                            >
                                                {p.code} ✕
                                            </span>
                                        ))
                                    )}
                                </div>
                            </Field>

                            <Field label="Menggantikan SERKEP" error={form.errors.replaces_id} fullWidth>
                                <select
                                    style={inputStyle}
                                    value={form.data.replaces_id ?? ''}
                                    onChange={e => form.setData('replaces_id', e.target.value)}
                                >
                                    <option value="">— (tidak menggantikan)</option>
                                    {replacesOptions.map(s => (
                                        <option key={s.id} value={s.id}>{s.nomor} — {s.title}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Dokumen */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <div>
                            <h3>Dokumen</h3>
                            <div className="sub">Unggah file draft untuk dianalisa AI Co-pilot.</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div
                            onClick={() => fileRef.current?.click()}
                            style={{
                                border: '2px dashed var(--ink-200)',
                                borderRadius: 8,
                                padding: 28,
                                textAlign: 'center',
                                background: 'var(--ink-50)',
                                cursor: 'pointer',
                            }}
                        >
                            <Upload size={28} style={{ color: 'var(--ink-500)' }} />
                            <div style={{ fontWeight: 600, marginTop: 8 }}>
                                {form.data.draft_file_path || 'Tarik & lepaskan file di sini'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                                DOCX, PDF — maks 20MB · AI menganalisa otomatis ±20 detik setelah upload
                            </div>
                            <button type="button" className="btn ghost sm" style={{ marginTop: 12 }}>
                                <FileText size={13} /> Pilih file
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                style={{ display: 'none' }}
                                onChange={e => {
                                    const f = e.target.files?.[0]
                                    if (f) form.setData('draft_file_path', f.name)
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 14 }}>
                            <AISuggestionCallout
                                title="AI: Generate draft surat dari template"
                                body={
                                    <>
                                        Pilih template dan AI Co-pilot akan menyusun draft awal yang siap di-review.
                                        <div className="ai-suggest" style={{ marginTop: 10 }}>
                                            <button type="button" className="s">Template SK Pedoman</button>
                                            <button type="button" className="s">Template SE Sosialisasi</button>
                                            <button type="button" className="s">Template Memo Internal</button>
                                        </div>
                                    </>
                                }
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Link href={route('serkep.index')} className="btn ghost">Batal</Link>
                    <button type="submit" className="btn primary" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Ajukan ke KaDep'}
                    </button>
                </div>
            </form>
        </AppLayout>
    )
}
