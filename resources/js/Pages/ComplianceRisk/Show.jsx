import { Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Pencil, ArrowLeft } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import Heatmap from '@/Components/Heatmap'
import HBar from '@/Components/HBar'
import RightRail from '@/Components/RightRail'
import Avatar from '@/Components/Avatar'
import Tag from '@/Components/Tag'

/* ── constants ── */
const STATUS_LABEL = {
    open:      'Open',
    mitigated: 'Termitigasi',
    accepted:  'Pemantauan',
    closed:    'Closed',
}
const STATUS_TONE = {
    open:      'draft',
    mitigated: 'termitigasi',
    accepted:  'pemantauan',
    closed:    'selesai',
}
const LEVEL_LABEL = { 1: 'Sangat Rendah', 2: 'Rendah', 3: 'Sedang', 4: 'Tinggi', 5: 'Sangat Tinggi' }

function pillTone(score) {
    if (score >= 20) return { bg: 'var(--rose-600)',  fg: '#fff' }
    if (score >= 13) return { bg: 'var(--rose-100)',  fg: 'var(--rose-600)'  }
    if (score >= 7)  return { bg: 'var(--amber-100)', fg: 'var(--amber-600)' }
    return            { bg: 'var(--brand-100)', fg: 'var(--brand-700)' }
}

function ScoreTile({ label, value, sub }) {
    return (
        <div style={{
            background: 'var(--ink-50)', border: '1px solid var(--ink-200)',
            borderRadius: 10, padding: '14px 16px', flex: 1, minWidth: 0,
        }}>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginTop: 4 }}>{value ?? '—'}</div>
            {sub && <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginTop: 2 }}>{sub}</div>}
        </div>
    )
}

function RiskBlock({ title, likelihood, impact }) {
    const score = (Number(likelihood) || 0) * (Number(impact) || 0)
    const tone  = pillTone(score)
    return (
        <div className="card" style={{ flex: 1 }}>
            <div className="card-head">
                <div>
                    <h3>{title}</h3>
                    <div className="sub">Likelihood × Impact</div>
                </div>
                <span className="pill" style={{ background: tone.bg, color: tone.fg, fontFamily: 'JetBrains Mono, monospace' }}>
                    Skor {score || '—'}
                </span>
            </div>
            <div className="card-body" style={{ display: 'flex', gap: 10 }}>
                <ScoreTile label="Likelihood" value={likelihood ?? '—'} sub={LEVEL_LABEL[likelihood] ?? '—'} />
                <ScoreTile label="Impact"     value={impact     ?? '—'} sub={LEVEL_LABEL[impact]     ?? '—'} />
                <ScoreTile label="Skor"       value={score      || '—'} sub={score >= 13 ? 'Tinggi' : score >= 7 ? 'Sedang' : score > 0 ? 'Rendah' : '—'} />
            </div>
        </div>
    )
}

export default function RisikoKepatuhanShow({ risk }) {
    const sm = STATUS_TONE[risk?.status] ?? 'draft'
    const residualScore = (Number(risk?.residual_likelihood) || 0) * (Number(risk?.residual_impact) || 0)
    const tone = pillTone(residualScore)

    // Compute heatmap currentCell from residual (likelihood = row from top: 5-l, impact = col: i-1)
    const currentCell = (risk?.residual_likelihood && risk?.residual_impact)
        ? { row: 5 - Number(risk.residual_likelihood), col: Number(risk.residual_impact) - 1 }
        : null

    /* ── kontrol & mitigasi (props or fallback) ── */
    const kontrol = risk?.controls ?? [
        { name: 'Review limit kredit cabang harian', tipe: 'Preventif',   eff: 85, owner: 'Sekar P.' },
        { name: 'Audit independen quarterly',         tipe: 'Detektif',    eff: 72, owner: 'Anita Y.' },
        { name: 'Eskalasi otomatis SLA terlewat',     tipe: 'Korektif',    eff: 60, owner: 'M. Krisna' },
    ]

    const linkedPolicies = risk?.linked_policies ?? []

    return (
        <AppLayout title={`Risiko — ${risk?.kode_risiko ?? ''}`}>
            <PageHeader
                title={risk?.nama_risiko ?? 'Detail Risiko'}
                description={risk?.kode_risiko}
                breadcrumbs={[
                    { label: 'Risiko Kepatuhan', href: route('risks.index') },
                    { label: risk?.kode_risiko ?? 'Detail' },
                ]}
                actions={
                    <>
                        <Link href={route('risks.index')} className="btn ghost">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                        <Link href={route('risks.edit', risk?.id)} className="btn primary">
                            <Pencil size={14} /> Edit
                        </Link>
                    </>
                }
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                <Badge status={sm} label={STATUS_LABEL[risk?.status] ?? risk?.status} />
                <span className="pill" style={{ background: tone.bg, color: tone.fg, fontFamily: 'JetBrains Mono, monospace' }}>
                    Residual: {residualScore || '—'}
                </span>
                {risk?.kategori && <Tag>{risk.kategori}</Tag>}
            </div>

            <RightRail
                main={
                    <>
                        {/* Inherent / Residual */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                            <RiskBlock
                                title="Inherent Risk"
                                likelihood={risk?.inherent_likelihood}
                                impact={risk?.inherent_impact}
                            />
                            <RiskBlock
                                title="Residual Risk"
                                likelihood={risk?.residual_likelihood}
                                impact={risk?.residual_impact}
                            />
                        </div>

                        {/* Heatmap */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <div>
                                    <h3>Posisi Risiko</h3>
                                    <div className="sub">Matriks Likelihood × Impact (Residual)</div>
                                </div>
                            </div>
                            <div className="card-body" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
                                <Heatmap currentCell={currentCell} size={340} />
                            </div>
                        </div>

                        {/* Kontrol & Mitigasi */}
                        <div className="card">
                            <div className="card-head">
                                <div>
                                    <h3>Kontrol &amp; Mitigasi</h3>
                                    <div className="sub">{kontrol.length} kontrol terpasang</div>
                                </div>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Kontrol</th>
                                        <th>Tipe</th>
                                        <th>Efektivitas</th>
                                        <th>Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kontrol.map((k, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{k.name}</td>
                                            <td><Tag tone={k.tipe === 'Preventif' ? 'brand' : k.tipe === 'Detektif' ? 'info' : 'amber'}>{k.tipe}</Tag></td>
                                            <td style={{ minWidth: 160 }}>
                                                <HBar value={k.eff} valueLabel={`${k.eff}%`} color={k.eff >= 80 ? 'var(--brand-600)' : k.eff >= 60 ? 'var(--gold-500)' : 'var(--amber-600)'} />
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Avatar name={k.owner} size={24} tone="brand" />
                                                    <span style={{ fontSize: 12.5 }}>{k.owner}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                }
                rail={
                    <>
                        <div className="card">
                            <div className="card-head">
                                <div>
                                    <h3>Detail Risiko</h3>
                                </div>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                                {[
                                    ['Kode Risiko', <span className="doc-id">{risk?.kode_risiko ?? '—'}</span>],
                                    ['Kategori', risk?.kategori ?? '—'],
                                    ['Status',   <Badge status={sm} label={STATUS_LABEL[risk?.status] ?? risk?.status} />],
                                    ['PIC',      risk?.pic_name ?? risk?.pic_user_id ?? '—'],
                                    ['Dibuat',   risk?.created_at ?? '—'],
                                ].map(([k, v], i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 8, borderBottom: i < 4 ? '1px solid var(--ink-100)' : 'none' }}>
                                        <span style={{ color: 'var(--ink-500)', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{k}</span>
                                        <span style={{ fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {linkedPolicies.length > 0 && (
                            <div className="card">
                                <div className="card-head">
                                    <div>
                                        <h3>Kebijakan Terkait</h3>
                                        <div className="sub">{linkedPolicies.length} dokumen tertaut</div>
                                    </div>
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {linkedPolicies.slice(0, 5).map((p, i) => (
                                        <Link key={i} href={p.id ? route('policies.show', p.id) : '#'} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 0', borderBottom: i < linkedPolicies.length - 1 ? '1px solid var(--ink-100)' : 'none', textDecoration: 'none' }}>
                                            <span className="doc-id">{p.code}</span>
                                            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-900)' }}>{p.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                }
            />
        </AppLayout>
    )
}
