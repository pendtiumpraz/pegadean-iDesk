import { useForm, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { ArrowLeft, Save } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import AISuggestionCallout from '@/Components/AISuggestionCallout'

const KATEGORI_OPTIONS = ['Operasional', 'Compliance', 'Reputasi', 'Strategis', 'Finansial', 'Hukum', 'Kredit', 'Pasar', 'Likuiditas']
const LEVEL_OPTIONS    = [1, 2, 3, 4, 5]
const LEVEL_LABEL      = { 1: 'Sangat Rendah', 2: 'Rendah', 3: 'Sedang', 4: 'Tinggi', 5: 'Sangat Tinggi' }

function pillTone(score) {
    if (score >= 20) return { bg: 'var(--rose-600)',  fg: '#fff' }
    if (score >= 13) return { bg: 'var(--rose-100)',  fg: 'var(--rose-600)'  }
    if (score >= 7)  return { bg: 'var(--amber-100)', fg: 'var(--amber-600)' }
    return            { bg: 'var(--brand-100)', fg: 'var(--brand-700)' }
}

function scoreLabel(score) {
    if (score >= 20) return 'Kritis'
    if (score >= 13) return 'Tinggi'
    if (score >= 7)  return 'Sedang'
    return score > 0 ? 'Rendah' : '—'
}

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

function ScoreDisplay({ l, i, label }) {
    const score = (Number(l) || 0) * (Number(i) || 0)
    const tone  = pillTone(score)
    return (
        <div style={{
            background: tone.bg, color: tone.fg,
            border: '1px solid var(--ink-200)',
            borderRadius: 10, padding: '12px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minWidth: 110,
        }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, opacity: 0.8 }}>{label}</span>
            <span style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 28, fontWeight: 600, lineHeight: 1.1, marginTop: 4 }}>{score || '—'}</span>
            <span style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{scoreLabel(score)}</span>
        </div>
    )
}

export default function RisikoKepatuhanEdit({ risk }) {
    const { data, setData, put, processing, errors } = useForm({
        kode_risiko:         risk?.kode_risiko          ?? '',
        nama_risiko:         risk?.nama_risiko          ?? '',
        kategori:            risk?.kategori             ?? '',
        inherent_likelihood: risk?.inherent_likelihood  ?? '',
        inherent_impact:     risk?.inherent_impact      ?? '',
        residual_likelihood: risk?.residual_likelihood  ?? '',
        residual_impact:     risk?.residual_impact      ?? '',
        status:              risk?.status               ?? 'open',
    })

    function submit(e) {
        e.preventDefault()
        put(route('risks.update', risk?.id))
    }

    return (
        <AppLayout title={`Edit Risiko — ${risk?.kode_risiko ?? ''}`}>
            <PageHeader
                title="Edit Risiko Kepatuhan"
                description={risk?.kode_risiko}
                breadcrumbs={[
                    { label: 'Risiko Kepatuhan', href: route('risks.index') },
                    { label: risk?.kode_risiko ?? 'Detail', href: route('risks.show', risk?.id) },
                    { label: 'Edit' },
                ]}
                actions={
                    <Link href={route('risks.show', risk?.id)} className="btn ghost">
                        <ArrowLeft size={14} /> Kembali
                    </Link>
                }
            />

            <AISuggestionCallout
                title="Tinjau ulang skor sebelum menyimpan"
                body="AI Co-pilot mendeteksi bahwa kontrol mitigasi tertaut belum diperbaharui — pastikan skor residual mencerminkan efektivitas terkini."
                style={{ marginBottom: 16 }}
            />

            <form onSubmit={submit}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Identitas Risiko</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <Field label="Kode Risiko" error={errors.kode_risiko} required>
                            <input
                                style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace', ...(errors.kode_risiko ? inputErr : {}) }}
                                value={data.kode_risiko}
                                onChange={e => setData('kode_risiko', e.target.value)}
                                placeholder="RCS-OPS-014"
                            />
                        </Field>

                        <Field label="Kategori" error={errors.kategori} required>
                            <select
                                style={{ ...inputBase, ...(errors.kategori ? inputErr : {}) }}
                                value={data.kategori}
                                onChange={e => setData('kategori', e.target.value)}
                            >
                                <option value="">— Pilih Kategori —</option>
                                {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </Field>

                        <Field label="Status" error={errors.status} required>
                            <select
                                style={{ ...inputBase, ...(errors.status ? inputErr : {}) }}
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                            >
                                <option value="open">Open</option>
                                <option value="mitigated">Termitigasi</option>
                                <option value="accepted">Pemantauan</option>
                                <option value="closed">Closed</option>
                            </select>
                        </Field>

                        <Field label="Nama Risiko" error={errors.nama_risiko} required colSpan={3}>
                            <input
                                style={{ ...inputBase, ...(errors.nama_risiko ? inputErr : {}) }}
                                value={data.nama_risiko}
                                onChange={e => setData('nama_risiko', e.target.value)}
                                placeholder="Deskripsi singkat risiko…"
                            />
                        </Field>
                    </div>

                    {['inherent', 'residual'].map(type => (
                        <div key={type} style={{ marginTop: 28 }}>
                            <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 18, fontWeight: 500, margin: '0 0 4px' }}>
                                {type === 'inherent' ? 'Inherent Risk' : 'Residual Risk'}
                            </h3>
                            <div style={{ color: 'var(--ink-500)', fontSize: 12.5, marginBottom: 14 }}>
                                {type === 'inherent'
                                    ? 'Skor risiko sebelum mitigasi (Likelihood × Impact)'
                                    : 'Skor risiko setelah kontrol diberlakukan'}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
                                <Field label="Likelihood (1–5)" error={errors[`${type}_likelihood`]} required>
                                    <select
                                        style={{ ...inputBase, ...(errors[`${type}_likelihood`] ? inputErr : {}) }}
                                        value={data[`${type}_likelihood`]}
                                        onChange={e => setData(`${type}_likelihood`, e.target.value)}
                                    >
                                        <option value="">— Pilih —</option>
                                        {LEVEL_OPTIONS.map(n => (
                                            <option key={n} value={n}>{n} — {LEVEL_LABEL[n]}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Impact (1–5)" error={errors[`${type}_impact`]} required>
                                    <select
                                        style={{ ...inputBase, ...(errors[`${type}_impact`] ? inputErr : {}) }}
                                        value={data[`${type}_impact`]}
                                        onChange={e => setData(`${type}_impact`, e.target.value)}
                                    >
                                        <option value="">— Pilih —</option>
                                        {LEVEL_OPTIONS.map(n => (
                                            <option key={n} value={n}>{n} — {LEVEL_LABEL[n]}</option>
                                        ))}
                                    </select>
                                </Field>
                                <ScoreDisplay
                                    l={data[`${type}_likelihood`]}
                                    i={data[`${type}_impact`]}
                                    label={`Skor ${type === 'inherent' ? 'Inherent' : 'Residual'}`}
                                />
                            </div>
                        </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--ink-200)' }}>
                        <Link href={route('risks.show', risk?.id)} className="btn ghost">Batal</Link>
                        <button type="submit" disabled={processing} className="btn primary">
                            <Save size={14} /> {processing ? 'Menyimpan…' : 'Update Risiko'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    )
}
