import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import ChipFilter from '@/Components/ChipFilter'
import DataTable from '@/Components/DataTable'
import Tag from '@/Components/Tag'
import { Folder, Search, Eye, Download, Plus, Sparkles, Archive } from 'lucide-react'

const TYPE_TONE = {
    induk:     { tone: 'brand', label: 'Induk' },
    anak:      { tone: 'info',  label: 'Anak' },
    eksternal: { tone: 'gold',  label: 'Eksternal' },
}

const REGULATION_IMPACTS = [
    {
        title: 'POJK 18/2024 telah berlaku efektif',
        body:  '17 SERKEP terdampak — 9 sudah disesuaikan, 8 dalam antrian',
        sev:   'high',
    },
    {
        title: 'SE OJK 7/2026 terbit pekan ini',
        body:  'Memengaruhi pasal pelaporan transaksi mencurigakan pada KAML-2.5',
        sev:   'med',
    },
    {
        title: 'POJK 22/2024 fase II — 12 Juni 2026',
        body:  '5 kebijakan internal perlu disesuaikan sebelum tanggal efektif',
        sev:   'low',
    },
]

const SEV_COLOR = {
    high: 'var(--rose-600)',
    med:  'var(--amber-600)',
    low:  'var(--brand-500)',
}

export default function KebijakanIndex({ policies, filters }) {
    const { data = [], links = [], meta = {} } = policies ?? {}

    // Counts (use API meta if present, fall back to "—" via undefined → not shown)
    const counts = {
        all:       meta?.total,
        induk:     undefined,
        anak:      undefined,
        eksternal: undefined,
    }

    const [activeType, setActiveType] = useState(filters?.type ?? '')
    const [activeCategory, setActiveCategory] = useState(filters?.category ?? '')
    const [search, setSearch] = useState(filters?.search ?? '')
    const [status, setStatus] = useState(filters?.status ?? '')

    function applyFilter(overrides = {}) {
        router.get(route('policies.index'), {
            search:   overrides.search   !== undefined ? overrides.search   : search,
            type:     overrides.type     !== undefined ? overrides.type     : activeType,
            category: overrides.category !== undefined ? overrides.category : activeCategory,
            status:   overrides.status   !== undefined ? overrides.status   : status,
        }, { preserveState: true, replace: true })
    }

    const TYPE_CHIPS = [
        { value: '',          label: 'Semua',     count: counts.all,       icon: Folder },
        { value: 'induk',     label: 'Induk',     count: counts.induk },
        { value: 'anak',      label: 'Anak',      count: counts.anak },
        { value: 'eksternal', label: 'Eksternal', count: counts.eksternal },
        { divider: true },
        { value: 'gcg',          label: 'GCG' },
        { value: 'aml-cft',      label: 'AML-CFT' },
        { value: 'manajemen-risiko', label: 'Manajemen Risiko' },
        { value: 'operasional',  label: 'Operasional' },
    ]

    function onChipSelect(value, chip) {
        // The first 4 are types, the rest are categories
        const isType = ['', 'induk', 'anak', 'eksternal'].includes(value)
        if (isType) {
            setActiveType(value)
            applyFilter({ type: value })
        } else {
            const newCat = activeCategory === value ? '' : value
            setActiveCategory(newCat)
            applyFilter({ category: newCat })
        }
    }

    const trailingSearch = (
        <div className="global-search" style={{ width: 280 }}>
            <span className="ic"><Search size={14} /></span>
            <input
                placeholder="Cari kebijakan…"
                style={{ height: 32 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
            />
        </div>
    )

    const columns = [
        {
            key: 'code',
            header: 'Kode',
            render: row => <span className="doc-id">{row.code ?? '—'}</span>,
        },
        {
            key: 'title',
            header: 'Judul',
            render: row => (
                <Link href={route('policies.show', row.id)} style={{ color: 'var(--ink-900)', fontWeight: 600, textDecoration: 'none' }}>
                    {row.title ?? '—'}
                </Link>
            ),
            style: { fontWeight: 600, maxWidth: 360 },
        },
        {
            key: 'category',
            header: 'Kategori',
            render: row => row.category ? <Tag>{row.category}</Tag> : <span style={{ color: 'var(--ink-400)' }}>—</span>,
        },
        {
            key: 'type',
            header: 'Tipe',
            render: row => {
                const k = (row.type ?? '').toLowerCase()
                const m = TYPE_TONE[k]
                if (m) return <Tag tone={m.tone}>{m.label}</Tag>
                return row.type ? <Tag>{row.type}</Tag> : <span style={{ color: 'var(--ink-400)' }}>—</span>
            },
        },
        {
            key: 'version',
            header: 'Versi',
            render: row => <span className="mono" style={{ fontSize: 12 }}>{row.version ?? '—'}</span>,
        },
        {
            key: 'effective_date',
            header: 'Berlaku',
            render: row => <span style={{ color: 'var(--ink-500)' }}>{row.effective_date ?? '—'}</span>,
        },
        {
            key: 'linked_serkep_count',
            header: 'Tertaut',
            render: row => {
                const n = row.linked_serkep_count ?? 0
                return (
                    <span>
                        <span style={{ fontWeight: 600 }}>{n}</span>{' '}
                        <span style={{ color: 'var(--ink-500)' }}>SERKEP</span>
                    </span>
                )
            },
        },
        {
            key: 'actions',
            header: '',
            render: row => (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <Link href={route('policies.show', row.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Lihat">
                        <Eye size={14} />
                    </Link>
                    {row.file_path && (
                        <a href={`/storage/${row.file_path}`} target="_blank" rel="noopener noreferrer" className="icon-btn" style={{ width: 28, height: 28 }} title="Unduh">
                            <Download size={14} />
                        </a>
                    )}
                </div>
            ),
            align: 'right',
        },
    ]

    return (
        <AppLayout title="Repository Kebijakan">
            <PageHeader
                title="Repository Kebijakan"
                description={`${meta?.total ?? data.length} kebijakan terindeks dan dapat dirujuk oleh AI Co-pilot.`}
                breadcrumbs={[{ label: 'Repository' }, { label: 'Kebijakan' }]}
                actions={
                    <>
                        <Link href={route('policies.trash')} className="btn ghost">
                            <Archive size={14} /> Arsip
                        </Link>
                        <Link href={route('policies.create')} className="btn primary">
                            <Plus size={14} /> Tambah dokumen
                        </Link>
                    </>
                }
            />

            <DataTable
                columns={columns}
                data={data}
                getRowKey={r => r.id}
                emptyMessage="Tidak ada data kebijakan."
                filters={
                    <ChipFilter
                        chips={TYPE_CHIPS.map(c => {
                            if (c.divider) return c
                            const isType = ['', 'induk', 'anak', 'eksternal'].includes(c.value)
                            const isActive = isType ? activeType === c.value : activeCategory === c.value
                            return { ...c, active: isActive }
                        })}
                        onSelect={onChipSelect}
                        trailing={trailingSearch}
                    />
                }
            />

            {/* Pagination */}
            {links.length > 0 && (
                <div style={{
                    marginTop: 12, padding: '0.75rem 1rem',
                    background: 'var(--paper)', border: '1px solid var(--ink-200)',
                    borderRadius: 12,
                    display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center',
                }}>
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveState
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            style={{
                                padding: '0.25rem 0.625rem', borderRadius: '0.375rem', fontSize: '0.8rem',
                                border: '1px solid var(--ink-200)',
                                background: link.active ? 'var(--brand-600)' : 'var(--paper)',
                                color: link.active ? '#fff' : link.url ? 'var(--ink-900)' : 'var(--ink-400)',
                                pointerEvents: link.url ? 'auto' : 'none',
                                textDecoration: 'none',
                            }}
                        />
                    ))}
                    {meta?.total !== undefined && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                            Total: {meta.total}
                        </span>
                    )}
                </div>
            )}

            <div className="two-col" style={{ marginTop: 16 }}>
                {/* Pemetaan Hierarki */}
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Pemetaan Hierarki</h3>
                            <div className="sub">Induk → Anak → Turunan</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ fontSize: 13 }}>
                        {data.length === 0 ? (
                            <p style={{ color: 'var(--ink-500)' }}>Belum ada kebijakan untuk dipetakan.</p>
                        ) : (
                            buildHierarchy(data).map((row, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '8px 0',
                                        borderBottom: '1px solid var(--ink-100)',
                                        paddingLeft: row.depth * 22,
                                    }}
                                >
                                    {row.depth > 0 && (
                                        <span style={{ color: 'var(--ink-300)', fontFamily: 'monospace' }}>{'└'}</span>
                                    )}
                                    <span className="doc-id" style={{ minWidth: 110 }}>{row.code ?? '—'}</span>
                                    <span style={{ flex: 1, fontWeight: row.depth === 0 ? 600 : 500 }}>{row.title}</span>
                                    <Tag>{row.tagLabel}</Tag>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Dampak Perubahan Regulasi */}
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Dampak Perubahan Regulasi</h3>
                            <div className="sub">Deteksi otomatis oleh AI</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {REGULATION_IMPACTS.map((c, i) => (
                            <div
                                key={i}
                                style={{
                                    borderLeft: `3px solid ${SEV_COLOR[c.sev]}`,
                                    padding: '4px 0 4px 12px',
                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{c.body}</div>
                            </div>
                        ))}
                        <button className="btn subtle" type="button" style={{ width: 'fit-content' }}>
                            <Sparkles size={14} /> Buat rencana penyesuaian otomatis
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

/**
 * Build a flat hierarchy list (induk → anak → turunan).
 * Uses parent_id when available; falls back to type-based grouping otherwise.
 */
function buildHierarchy(data) {
    const out = []
    const byParent = new Map()
    data.forEach(p => {
        const pid = p.parent_id ?? null
        if (!byParent.has(pid)) byParent.set(pid, [])
        byParent.get(pid).push(p)
    })
    const tagFor = (p) => {
        const t = (p.type ?? '').toLowerCase()
        if (t === 'induk') return 'Induk'
        if (t === 'anak') return 'Anak'
        if (t === 'eksternal') return 'Eksternal'
        return p.type ?? '—'
    }
    function walk(parentId, depth) {
        const kids = byParent.get(parentId) ?? []
        kids.forEach(p => {
            out.push({
                code: p.code,
                title: p.title,
                depth,
                tagLabel: depth === 0 ? tagFor(p) : depth === 1 ? 'Anak' : 'Turunan',
            })
            if (depth < 2) walk(p.id, depth + 1)
        })
    }
    walk(null, 0)
    // Cap to keep card compact
    return out.slice(0, 8)
}
