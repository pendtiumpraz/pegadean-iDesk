import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import Stepper from '@/Components/Stepper'
import DocShell from '@/Components/DocShell'
import DocPaper from '@/Components/DocPaper'
import AIPanel from '@/Components/AIPanel'
import AICard from '@/Components/AICard'
import AvatarStack from '@/Components/AvatarStack'
import { Pencil, Send } from 'lucide-react'

const WORKFLOW_STEPS = [
    { key: 'draft',      label: 'Pengajuan' },
    { key: 'review_kadep', label: 'Review Kadep' },
    { key: 'review_cpp', label: 'Review CPP' },
    { key: 'kajian',     label: 'Kajian Hukum' },
    { key: 'pengesahan', label: 'Pengesahan' },
    { key: 'penomoran',  label: 'Penomoran' },
    { key: 'released',   label: 'Penerbitan' },
]

const STATUS_TO_INDEX = {
    draft: 0,
    review_kadep: 1,
    review: 2,
    review_cpp: 2,
    kajian: 3,
    approve: 4,
    pengesahan: 4,
    penomoran: 5,
    released: 6,
    published: 6,
}

const FALLBACK_FINDINGS = [
    {
        id: 1,
        severity: 'med',
        pasal: 'Pasal 3',
        title: 'Definisi belum selaras dengan kebijakan induk',
        body: 'Definisi pada draft tidak selaras dengan Kebijakan Induk Manajemen Risiko Korporasi (KIMRK) versi 4.2. Disarankan menggunakan terminologi standar.',
        pasalRef: 'KIMRK §1.4 · POJK 18/2024 Pasal 2',
    },
    {
        id: 2,
        severity: 'high',
        pasal: 'Pasal 7 ayat (2)',
        title: 'Potensi konflik dengan POJK 18/2024',
        body: 'Klausul ini mengizinkan pendelegasian persetujuan limit kepada Pejabat Cabang. Hal ini bertentangan dengan POJK 18/2024 Pasal 14 yang mensyaratkan persetujuan minimum oleh Komite Risiko.',
        pasalRef: 'POJK 18/2024 Pasal 14 · RCS-OPS-014',
        quote: '"Persetujuan limit di tingkat cabang dapat didelegasikan kepada Pejabat Cabang dengan plafon hingga Rp 5 miliar…"',
    },
    {
        id: 3,
        severity: 'low',
        pasal: 'Pasal 9',
        title: 'Frekuensi reviu kontrol belum ditetapkan',
        body: 'Tidak ditemukan periode reviu efektivitas kontrol. Standar internal mensyaratkan reviu minimal semesteran.',
        pasalRef: 'BeComply BCP-203 · KIMRK §6.1',
    },
]

const TOC_DEFAULT = [
    'Ketentuan Umum',
    'Ruang Lingkup',
    'Definisi',
    'Prinsip Pengelolaan',
    'Identifikasi Risiko',
    'Pengukuran Risiko',
    'Limit dan Persetujuan',
    'Mitigasi & Kontrol',
    'Pemantauan',
    'Pelaporan',
    'Tata Kelola',
    'Dokumentasi',
    'Sanksi',
    'Ketentuan Peralihan',
    'Penutup',
]

function reviewerUsers(serkep) {
    if (!serkep) return []
    if (Array.isArray(serkep.reviewers)) {
        return serkep.reviewers.map((r, i) => ({
            name: r.name ?? r,
            tone: ['brand', 'gold', 'info', 'rose'][i % 4],
        }))
    }
    if (typeof serkep.signer === 'string' && serkep.signer.trim()) {
        return serkep.signer.split(/[,;·]/).map((n, i) => ({
            name: n.trim(),
            tone: ['brand', 'gold', 'info', 'rose'][i % 4],
        }))
    }
    return []
}

/** Map controller findings (ai_reviews) to AICard-friendly shape. */
function mapFindings(serkep) {
    const reviews = serkep?.ai_reviews ?? []
    const out = []
    reviews.forEach(r => {
        let issues = []
        try {
            issues = r.issues_json ? (typeof r.issues_json === 'string' ? JSON.parse(r.issues_json) : r.issues_json) : []
        } catch { issues = [] }
        if (Array.isArray(issues)) {
            issues.forEach((it, i) => {
                if (typeof it === 'string') {
                    out.push({ id: `${r.id}-${i}`, severity: 'med', title: it, body: it })
                } else {
                    out.push({
                        id: `${r.id}-${i}`,
                        severity: it.severity ?? it.sev ?? 'med',
                        pasal:    it.pasal ?? it.section,
                        title:    it.title ?? '',
                        body:     it.body ?? it.description ?? '',
                        quote:    it.quote,
                        pasalRef: it.ref ?? it.pasal_ref ?? '',
                    })
                }
            })
        }
    })
    return out.length > 0 ? out : FALLBACK_FINDINGS
}

export default function SerkepShow({ serkep }) {
    const [activeFindingId, setActiveFindingId] = useState(null)
    const [aiTab, setAiTab] = useState('findings')

    const statusKey = (serkep?.status ?? '').toLowerCase()
    const currentIdx = STATUS_TO_INDEX[statusKey] ?? 0

    const steps = WORKFLOW_STEPS.map((s, i) => ({
        label: s.label,
        status: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'todo',
    }))

    const reviewers = reviewerUsers(serkep)
    const findings = mapFindings(serkep)

    const FINDING_COUNT = findings.length
    const SUGGEST_COUNT = serkep?.ai_reviews?.length ?? 0
    const REF_COUNT = serkep?.policies?.length ?? 0

    const tabs = [
        { key: 'findings', label: 'Temuan', count: FINDING_COUNT },
        { key: 'suggest',  label: 'Saran',  count: SUGGEST_COUNT > 0 ? SUGGEST_COUNT : null },
        { key: 'cite',     label: 'Rujukan', count: REF_COUNT > 0 ? REF_COUNT : null },
        { key: 'chat',     label: 'Tanya AI' },
    ]

    // Build doc-paper meta + body
    const paperMeta = [
        { label: 'Kode',           value: <span className="doc-id">{serkep?.nomor ?? '—'}</span> },
        { label: 'Tanggal Berlaku', value: serkep?.effective_date ?? '—' },
        { label: 'Pemrakarsa',     value: serkep?.pemrakarsa_div ?? '—' },
        { label: 'Klasifikasi',    value: serkep?.klasifikasi ?? 'Internal' },
    ]

    return (
        <AppLayout title={`SERKEP — ${serkep?.nomor ?? ''}`}>
            <PageHeader
                title={serkep?.title ?? 'Detail SERKEP'}
                description={
                    <span style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        {serkep?.status && <Badge status={statusKey} />}
                        {serkep?.pemrakarsa_div && (
                            <span>
                                Pemrakarsa: <b style={{ color: 'var(--ink-700)' }}>{serkep.pemrakarsa_div}</b>
                            </span>
                        )}
                        {serkep?.version && <span>v{serkep.version}</span>}
                        {serkep?.page_count && <span>· {serkep.page_count} halaman</span>}
                        {serkep?.sla_due_at && <SlaInline sla={serkep.sla_due_at} />}
                    </span>
                }
                breadcrumbs={[
                    { label: 'Tinjauan SERKEP', href: route('serkep.index') },
                    { label: serkep?.nomor ?? 'Detail' },
                ]}
                actions={
                    <>
                        <Link href={route('serkep.edit', serkep?.id)} className="btn ghost">
                            <Pencil size={14} /> Edit
                        </Link>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={() => router.visit(route('disposisi.index'))}
                        >
                            <Send size={14} /> Buat Disposisi
                        </button>
                    </>
                }
            />

            {/* Stepper across the top */}
            <div style={{ marginBottom: 12 }}>
                <Stepper
                    steps={steps}
                    trailing={
                        reviewers.length > 0 ? (
                            <>
                                <span>Reviewer:</span>
                                <AvatarStack users={reviewers} max={3} size={24} />
                            </>
                        ) : null
                    }
                />
            </div>

            <DocShell
                toc={
                    <>
                        <h4>Workflow</h4>
                        <Stepper steps={steps} orientation="vertical" />
                        <div className="divider" />
                        <h4>Daftar Isi</h4>
                        {TOC_DEFAULT.map((t, i) => (
                            <a
                                key={i}
                                href={`#bab-${i + 1}`}
                                className="toc-item"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <span className="num">§{i + 1}</span>
                                <span style={{ flex: 1 }}>{t}</span>
                            </a>
                        ))}
                    </>
                }
                paper={
                    <DocPaper
                        eyebrow={`SERKEP · ${serkep?.nomor ?? '—'}${serkep?.version ? ` · v${serkep.version}` : ''}`}
                        title={serkep?.title ?? 'Surat Edaran Kepatuhan'}
                        meta={paperMeta}
                    >
                        {serkep?.body ? (
                            <div dangerouslySetInnerHTML={{ __html: serkep.body }} />
                        ) : (
                            <>
                                <div className="pasal" id="bab-1">Pasal 1 — Ketentuan Umum</div>
                                <p>
                                    Surat Edaran Kepatuhan ini mengatur ketentuan dan pedoman pelaksanaan{' '}
                                    <b>{serkep?.title ?? 'kebijakan'}</b> di lingkungan Perusahaan,
                                    sebagai turunan dari kebijakan induk yang berlaku.
                                </p>

                                <div className="pasal" id="bab-3">Pasal 3 — Definisi</div>
                                <p>Dalam surat edaran ini yang dimaksud dengan:</p>
                                <ol>
                                    <li>
                                        <b>Pemrakarsa</b> adalah unit kerja yang mengajukan dan bertanggung
                                        jawab atas substansi naskah ini.
                                    </li>
                                    <li>
                                        <b>Komite Risiko</b> adalah forum pengambilan keputusan terkait
                                        paparan risiko di tingkat enterprise.
                                    </li>
                                </ol>

                                <div className="pasal" id="bab-7">Pasal 7 — Limit dan Persetujuan</div>
                                <p>
                                    (1) Setiap eksposur yang melebihi ambang batas yang ditetapkan
                                    wajib memperoleh persetujuan sesuai jenjang kewenangan.
                                </p>
                                <p>
                                    (2) Pendelegasian persetujuan dilakukan secara berjenjang
                                    sesuai dengan ketentuan internal dan regulasi yang berlaku.
                                </p>

                                <div className="pasal" id="bab-15">Pasal 15 — Penutup</div>
                                <p>
                                    Surat edaran ini mulai berlaku sejak{' '}
                                    {serkep?.effective_date ?? <span style={{ color: 'var(--ink-400)' }}>____________</span>}{' '}
                                    dan akan ditinjau ulang paling lambat 2 tahun sejak tanggal
                                    pemberlakuan.
                                </p>
                            </>
                        )}
                    </DocPaper>
                }
                aiPanel={
                    <AIPanel
                        tabs={tabs}
                        activeTab={aiTab}
                        onTabChange={setAiTab}
                        analysisMeta={
                            serkep?.ai_reviews?.[0]?.created_at
                                ? `Analisa terakhir: ${serkep.ai_reviews[0].created_at}`
                                : 'Analisa AI Co-pilot — siap dijalankan'
                        }
                        findings={
                            findings.map(f => (
                                <AICard
                                    key={f.id}
                                    severity={f.severity}
                                    title={f.title}
                                    pasal={f.pasal}
                                    body={f.body}
                                    quote={f.quote}
                                    pasalRef={f.pasalRef}
                                    active={activeFindingId === f.id}
                                    onClick={() => setActiveFindingId(f.id)}
                                    onAccept={() => {}}
                                    onDiscuss={() => {}}
                                    onIgnore={() => {}}
                                />
                            ))
                        }
                        suggestions={
                            <p style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                                Saran perbaikan akan muncul di sini setelah AI menyelesaikan analisa.
                            </p>
                        }
                        references={
                            (serkep?.policies?.length ?? 0) === 0 ? (
                                <p style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                                    Belum ada kebijakan induk yang dirujuk.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {serkep.policies.map(p => (
                                        <Link
                                            key={p.id}
                                            href={route('policies.show', p.id)}
                                            style={{
                                                padding: 10, border: '1px solid var(--ink-200)', borderRadius: 8,
                                                textDecoration: 'none', color: 'var(--ink-900)',
                                            }}
                                        >
                                            <div className="doc-id" style={{ fontSize: 11 }}>{p.code}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                                            {p.category && (
                                                <Tag tone="brand" style={{ marginTop: 6 }}>{p.category}</Tag>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )
                        }
                        chat={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{
                                    alignSelf: 'flex-end', maxWidth: '85%',
                                    background: 'var(--brand-600)', color: 'white',
                                    padding: '8px 12px', borderRadius: '12px 12px 4px 12px',
                                    fontSize: 13,
                                }}>
                                    Apakah pasal-pasal di SERKEP ini sudah selaras dengan kebijakan induk?
                                </div>
                                <div style={{
                                    maxWidth: '90%', background: 'var(--ink-50)',
                                    padding: '10px 12px', borderRadius: '12px 12px 12px 4px',
                                    fontSize: 13, lineHeight: 1.55,
                                }}>
                                    Mulai analisa dengan menekan tombol "Analisa AI" atau ketik pertanyaan di bawah.
                                </div>
                            </div>
                        }
                        suggestChips={[
                            'Bandingkan dgn kebijakan induk',
                            'Ringkas perubahan versi',
                            'Cek konsistensi terminologi',
                        ]}
                    />
                }
            />
        </AppLayout>
    )
}

function SlaInline({ sla }) {
    if (!sla) return null
    const due = new Date(sla)
    const now = new Date()
    const days = Math.round((due - now) / (1000 * 60 * 60 * 24))
    if (days < 0) {
        return <span style={{ color: 'var(--rose-600)', fontWeight: 600 }}>SLA terlewat {Math.abs(days)} hari</span>
    }
    if (days <= 5) {
        return <span style={{ color: 'var(--amber-600)', fontWeight: 600 }}>SLA tersisa {days} hari</span>
    }
    return <span style={{ color: 'var(--ink-500)' }}>SLA tersisa {days} hari</span>
}
