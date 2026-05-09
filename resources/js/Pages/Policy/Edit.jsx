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

export default function KebijakanEdit({ policy, parentPolicies = [] }) {
    const fileRef = useRef(null)
    const form = useForm({
        code:           policy?.code ?? '',
        title:          policy?.title ?? '',
        type:           policy?.type ?? 'induk',
        category:       policy?.category ?? '',
        version:        policy?.version ?? '',
        effective_date: policy?.effective_date ?? '',
        status:         policy?.status ?? 'draft',
        parent_id:      policy?.parent_id ?? '',
        summary:        policy?.summary ?? '',
        excerpt:        policy?.excerpt ?? '',
        pasal_ref:      policy?.pasal_ref ?? '',
        owner_div:      policy?.owner_div ?? '',
        pengesah:       policy?.pengesah ?? '',
        file: null,
        _method: 'PUT',
    }, { forceFormData: true })

    function submit(e) {
        e.preventDefault()
        form.post(route('policies.update', policy.id))
    }

    function handleFile(e) {
        form.setData('file', e.target.files?.[0] ?? null)
    }

    return (
        <AppLayout title={`Edit Kebijakan — ${policy?.code ?? ''}`}>
            <PageHeader
                title="Edit Kebijakan"
                description={policy?.code}
                breadcrumbs={[
                    { label: 'Repository', href: route('policies.index') },
                    { label: policy?.code ?? 'Detail', href: route('policies.show', policy?.id) },
                    { label: 'Edit' },
                ]}
            />

            <div style={{ marginBottom: 16 }}>
                <AISuggestionCallout
                    title="AI: Auto-extract metadata dari dokumen yang diunggah"
                    body={
                        <>
                            Unggah versi dokumen baru dan AI akan menyarankan perubahan metadata, mendeteksi pasal yang berubah, dan menandai dampak ke SERKEP terkait.
                            <div className="ai-suggest" style={{ marginTop: 10 }}>
                                <button type="button" className="s">Bandingkan dengan versi sebelumnya</button>
                                <button type="button" className="s">Deteksi pasal berubah</button>
                                <button type="button" className="s">Sarankan revisi rujukan</button>
                            </div>
                        </>
                    }
                />
            </div>

            <form onSubmit={submit}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Identitas Kebijakan</h3>
                            <div className="sub">Perubahan disimpan sebagai versi baru dalam riwayat.</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div style={fieldGrid}>
                            <Field label="Kode *" error={form.errors.code}>
                                <input
                                    type="text"
                                    style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
                                    value={form.data.code}
                                    onChange={e => form.setData('code', e.target.value)}
                                    required
                                />
                            </Field>

                            <Field label="Versi" error={form.errors.version}>
                                <input
                                    type="text"
                                    style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace' }}
                                    value={form.data.version}
                                    onChange={e => form.setData('version', e.target.value)}
                                />
                            </Field>

                            <Field label="Judul *" error={form.errors.title} fullWidth>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={form.data.title}
                                    onChange={e => form.setData('title', e.target.value)}
                                    required
                                />
                            </Field>

                            <Field label="Tipe *" error={form.errors.type}>
                                <select style={inputStyle} value={form.data.type} onChange={e => form.setData('type', e.target.value)}>
                                    <option value="induk">Induk</option>
                                    <option value="anak">Anak</option>
                                    <option value="eksternal">Eksternal</option>
                                </select>
                            </Field>

                            <Field label="Kategori *" error={form.errors.category}>
                                <select style={inputStyle} value={form.data.category} onChange={e => form.setData('category', e.target.value)} required>
                                    <option value="">Pilih kategori</option>
                                    <option value="GCG">GCG</option>
                                    <option value="AML-CFT">AML-CFT</option>
                                    <option value="Manajemen Risiko">Manajemen Risiko</option>
                                    <option value="Operasional">Operasional</option>
                                    <option value="OJK">OJK</option>
                                    <option value="Pengawasan">Pengawasan</option>
                                    <option value="TI">TI</option>
                                </select>
                            </Field>

                            <Field label="Status *" error={form.errors.status}>
                                <select style={inputStyle} value={form.data.status} onChange={e => form.setData('status', e.target.value)} required>
                                    <option value="draft">Draft</option>
                                    <option value="review">Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="active">Aktif</option>
                                    <option value="expired">Expired</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </Field>

                            <Field label="Tanggal Berlaku" error={form.errors.effective_date}>
                                <input
                                    type="date"
                                    style={inputStyle}
                                    value={form.data.effective_date}
                                    onChange={e => form.setData('effective_date', e.target.value)}
                                />
                            </Field>

                            <Field label="Kebijakan Induk" error={form.errors.parent_id}>
                                <select
                                    style={inputStyle}
                                    value={form.data.parent_id ?? ''}
                                    onChange={e => form.setData('parent_id', e.target.value)}
                                >
                                    <option value="">— (kebijakan induk)</option>
                                    {parentPolicies.filter(p => p.id !== policy?.id).map(p => (
                                        <option key={p.id} value={p.id}>{p.code} — {p.title}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Divisi Pemilik" error={form.errors.owner_div}>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={form.data.owner_div}
                                    onChange={e => form.setData('owner_div', e.target.value)}
                                />
                            </Field>

                            <Field label="Pengesah" error={form.errors.pengesah}>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={form.data.pengesah}
                                    onChange={e => form.setData('pengesah', e.target.value)}
                                />
                            </Field>

                            <Field label="Ringkasan" error={form.errors.summary} fullWidth>
                                <textarea
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                                    value={form.data.summary}
                                    onChange={e => form.setData('summary', e.target.value)}
                                />
                            </Field>

                            <Field label="Kutipan Pasal" error={form.errors.excerpt} fullWidth>
                                <textarea
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: "'IBM Plex Serif', Georgia, serif" }}
                                    value={form.data.excerpt}
                                    onChange={e => form.setData('excerpt', e.target.value)}
                                />
                            </Field>

                            <Field label="Rujukan Pasal" error={form.errors.pasal_ref}>
                                <input
                                    type="text"
                                    style={inputStyle}
                                    value={form.data.pasal_ref}
                                    onChange={e => form.setData('pasal_ref', e.target.value)}
                                />
                            </Field>

                            <Field label="Ganti Dokumen (opsional)" error={form.errors.file} fullWidth>
                                {policy?.file_path && !form.data.file && (
                                    <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-500)' }}>
                                        <FileText size={13} />
                                        <a href={`/storage/${policy.file_path}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-700)' }}>
                                            Dokumen saat ini
                                        </a>
                                    </div>
                                )}
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
                                        {form.data.file ? form.data.file.name : 'Tarik & lepaskan file baru'}
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4 }}>
                                        DOCX, PDF — maks 20MB · biarkan kosong untuk mempertahankan dokumen saat ini
                                    </div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        style={{ display: 'none' }}
                                        onChange={handleFile}
                                    />
                                </div>
                            </Field>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Link href={route('policies.show', policy?.id)} className="btn ghost">Batal</Link>
                    <button type="submit" className="btn primary" disabled={form.processing}>
                        {form.processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </AppLayout>
    )
}
