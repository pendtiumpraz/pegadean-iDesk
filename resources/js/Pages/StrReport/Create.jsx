import { useForm, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { ArrowLeft, Save } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import AISuggestionCallout from '@/Components/AISuggestionCallout'

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

export default function StrCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nomor_str:         '',
        nasabah_ref:       '',
        nasabah_nama:      '',
        nasabah_nik:       '',
        jumlah_transaksi:  '',
        tanggal_transaksi: '',
        deskripsi:         '',
        indikasi:          '',
        status:            'draft',
    })

    function submit(e) {
        e.preventDefault()
        post(route('str.store'))
    }

    return (
        <AppLayout title="Buat STR">
            <PageHeader
                title="Buat Laporan STR"
                description="Suspicious Transaction Report — laporan transaksi mencurigakan ke PPATK."
                breadcrumbs={[
                    { label: 'STR', href: route('str.index') },
                    { label: 'Buat' },
                ]}
                actions={
                    <Link href={route('str.index')} className="btn ghost">
                        <ArrowLeft size={14} /> Kembali
                    </Link>
                }
            />

            <AISuggestionCallout
                title="AI: Klasifikasikan jenis indikasi dari deskripsi"
                body="Setelah Anda mengisi deskripsi transaksi, AI Co-pilot dapat mengusulkan klasifikasi indikasi (smurfing, structuring, layering, round-trip, dll) berdasarkan pola yang terdeteksi."
                style={{ marginBottom: 16 }}
            />

            <form onSubmit={submit}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Identitas Laporan</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Nomor STR" error={errors.nomor_str} required>
                            <input
                                style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace', ...(errors.nomor_str ? inputErr : {}) }}
                                value={data.nomor_str}
                                onChange={e => setData('nomor_str', e.target.value)}
                                placeholder="STR-2026-0001"
                            />
                        </Field>

                        <Field label="Status" error={errors.status}>
                            <select
                                style={{ ...inputBase, ...(errors.status ? inputErr : {}) }}
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                            >
                                <option value="draft">Draft</option>
                                <option value="review">Review</option>
                            </select>
                        </Field>
                    </div>

                    <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, margin: '24px 0 16px' }}>Informasi Nasabah</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <Field label="Nama Nasabah" error={errors.nasabah_nama} required>
                            <input
                                style={{ ...inputBase, ...(errors.nasabah_nama ? inputErr : {}) }}
                                value={data.nasabah_nama}
                                onChange={e => setData('nasabah_nama', e.target.value)}
                                placeholder="Nama lengkap nasabah"
                            />
                        </Field>

                        <Field label="NIK" error={errors.nasabah_nik}>
                            <input
                                style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace', ...(errors.nasabah_nik ? inputErr : {}) }}
                                value={data.nasabah_nik}
                                onChange={e => setData('nasabah_nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                placeholder="3271xxxxxxxxxxxxx"
                                maxLength={16}
                            />
                        </Field>

                        <Field label="Referensi Nasabah" error={errors.nasabah_ref}>
                            <input
                                style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace', ...(errors.nasabah_ref ? inputErr : {}) }}
                                value={data.nasabah_ref}
                                onChange={e => setData('nasabah_ref', e.target.value)}
                                placeholder="ID nasabah core"
                            />
                        </Field>
                    </div>

                    <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, margin: '24px 0 16px' }}>Informasi Transaksi</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field label="Jumlah Transaksi (Rp)" error={errors.jumlah_transaksi} required>
                            <input
                                type="number"
                                min="0"
                                style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace', ...(errors.jumlah_transaksi ? inputErr : {}) }}
                                value={data.jumlah_transaksi}
                                onChange={e => setData('jumlah_transaksi', e.target.value)}
                                placeholder="500000000"
                            />
                        </Field>

                        <Field label="Tanggal Transaksi" error={errors.tanggal_transaksi} required>
                            <input
                                type="date"
                                style={{ ...inputBase, ...(errors.tanggal_transaksi ? inputErr : {}) }}
                                value={data.tanggal_transaksi}
                                onChange={e => setData('tanggal_transaksi', e.target.value)}
                            />
                        </Field>

                        <Field label="Deskripsi Transaksi" error={errors.deskripsi} required colSpan={2}>
                            <textarea
                                rows={4}
                                style={{ ...inputBase, resize: 'vertical', fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 14, lineHeight: 1.6, ...(errors.deskripsi ? inputErr : {}) }}
                                value={data.deskripsi}
                                onChange={e => setData('deskripsi', e.target.value)}
                                placeholder="Uraikan transaksi yang dilaporkan secara naratif…"
                            />
                        </Field>

                        <Field label="Indikasi Pencucian Uang" error={errors.indikasi} required colSpan={2}>
                            <textarea
                                rows={4}
                                style={{ ...inputBase, resize: 'vertical', ...(errors.indikasi ? inputErr : {}) }}
                                value={data.indikasi}
                                onChange={e => setData('indikasi', e.target.value)}
                                placeholder="Jelaskan pola atau indikasi mencurigakan (smurfing, structuring, dll)…"
                            />
                        </Field>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--ink-200)' }}>
                        <Link href={route('str.index')} className="btn ghost">Batal</Link>
                        <button type="submit" disabled={processing} className="btn primary">
                            <Save size={14} /> {processing ? 'Menyimpan…' : 'Simpan STR'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    )
}
