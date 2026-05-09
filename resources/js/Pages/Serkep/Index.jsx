import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import ChipFilter from '@/Components/ChipFilter'
import DataTable from '@/Components/DataTable'
import Tag from '@/Components/Tag'
import Badge from '@/Components/Badge'
import AvatarStack from '@/Components/AvatarStack'
import { Plus, Search, User, AlertOctagon, Clock, Eye, Pencil, Trash2 } from 'lucide-react'

const STATUS_CHIPS = [
    { value: '',           label: 'Semua' },
    { value: 'draft',      label: 'Drafting' },
    { value: 'review_cpp', label: 'Review CPP' },
    { value: 'kajian',     label: 'Kajian' },
    { value: 'pengesahan', label: 'Pengesahan' },
    { value: 'released',   label: 'Terbit' },
]

const STATUS_LABEL = {
    draft:      'Drafting',
    review_cpp: 'Review CPP',
    review:     'Review CPP',
    kajian:     'Kajian',
    pengesahan: 'Pengesahan',
    approve:    'Pengesahan',
    released:   'Terbit',
    published:  'Terbit',
}

const JENIS_TONE = {
    surat_edaran:    { tone: 'brand', label: 'Surat Edaran' },
    surat_keputusan: { tone: 'info',  label: 'Surat Keputusan' },
    instruksi:       { tone: 'amber', label: 'Instruksi' },
    memo:            { tone: 'neutral', label: 'Memo' },
}

/** Compute SLA chip from sla_due_at ISO datetime. */
function slaChip(sla) {
    if (!sla) return <span style={{ color: 'var(--ink-400)' }}>—</span>
    const due = new Date(sla)
    const now = new Date()
    const days = Math.round((due - now) / (1000 * 60 * 60 * 24))
    if (days < 0) {
        return <span style={{ color: 'var(--rose-600)', fontWeight: 600 }}>{`SLA ${days}`}</span>
    }
    if (days <= 5) {
        return <span style={{ color: 'var(--amber-600)', fontWeight: 600 }}>{days} hari</span>
    }
    return <span style={{ color: 'var(--ink-700)' }}>{days} hari</span>
}

/** Convert reviewers list (string of names or array) into AvatarStack users. */
function reviewerUsers(serkep) {
    const r = serkep.reviewers ?? serkep.signer ?? null
    if (!r) return []
    if (Array.isArray(r)) {
        return r.map((x, i) => ({ name: x.name ?? x, tone: ['brand', 'gold', 'info', 'rose'][i % 4] }))
    }
    if (typeof r === 'string') {
        return r.split(/[,;·]/).map((n, i) => ({ name: n.trim(), tone: ['brand', 'gold', 'info', 'rose'][i % 4] }))
    }
    return []
}

function relativeTime(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.round((now - d) / 1000)
    if (diff < 60) return `${diff} dtk lalu`
    if (diff < 3600) return `${Math.round(diff / 60)} mnt lalu`
    if (diff < 86400) return `${Math.round(diff / 3600)} jam lalu`
    if (diff < 86400 * 7) return `${Math.round(diff / 86400)} hari lalu`
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

export default function SerkepIndex({ serkeps, filters }) {
    const { data = [], links = [], meta = {} } = serkeps ?? {}

    const [activeStatus, setActiveStatus] = useState(filters?.status ?? '')
    const [search, setSearch]             = useState(filters?.search ?? '')
    const [jenis, setJenis]               = useState(filters?.jenis_naskah ?? '')

    function applyFilter(overrides = {}) {
        router.get(route('serkep.index'), {
            search:       overrides.search       !== undefined ? overrides.search       : search,
            status:       overrides.status       !== undefined ? overrides.status       : activeStatus,
            jenis_naskah: overrides.jenis_naskah !== undefined ? overrides.jenis_naskah : jenis,
        }, { preserveState: true, replace: true })
    }

    function handleDelete(id) {
        if (!confirm('Hapus serkep ini?')) return
        router.delete(route('serkep.destroy', id))
    }

    const trailingChips = (
        <>
            <button type="button" className="chip"><User size={12} /> Pemrakarsa</button>
            <button type="button" className="chip"><AlertOctagon size={12} /> Risiko</button>
            <button type="button" className="chip"><Clock size={12} /> SLA</button>
        </>
    )

    const columns = [
        {
            key: 'nomor',
            header: 'No.',
            render: row => <span className="doc-id">{row.nomor ?? '—'}</span>,
        },
        {
            key: 'title',
            header: 'Judul',
            render: row => (
                <Link href={route('serkep.show', row.id)} style={{ color: 'var(--ink-900)', fontWeight: 600, textDecoration: 'none' }}>
                    {row.title ?? '—'}
                </Link>
            ),
            style: { fontWeight: 600, maxWidth: 360 },
        },
        {
            key: 'jenis_naskah',
            header: 'Jenis',
            render: row => {
                const k = (row.jenis_naskah ?? '').toLowerCase()
                const m = JENIS_TONE[k]
                if (m) return <Tag tone={m.tone}>{m.label}</Tag>
                return row.jenis_naskah ? <Tag>{row.jenis_naskah}</Tag> : <span style={{ color: 'var(--ink-400)' }}>—</span>
            },
        },
        {
            key: 'pemrakarsa_div',
            header: 'Pemrakarsa',
            render: row => row.pemrakarsa_div ?? <span style={{ color: 'var(--ink-400)' }}>—</span>,
        },
        {
            key: 'reviewers',
            header: 'Reviewer',
            render: row => {
                const u = reviewerUsers(row)
                return u.length > 0 ? <AvatarStack users={u} max={3} size={24} /> : <span style={{ color: 'var(--ink-400)' }}>—</span>
            },
        },
        {
            key: 'sla_due_at',
            header: 'SLA',
            render: row => slaChip(row.sla_due_at),
        },
        {
            key: 'status',
            header: 'Tahap',
            render: row => {
                const k = (row.status ?? '').toLowerCase()
                const lab = STATUS_LABEL[k] ?? row.status ?? '—'
                return <Badge status={k} label={lab} />
            },
        },
        {
            key: 'updated_at',
            header: 'Update',
            render: row => <span style={{ color: 'var(--ink-500)' }}>{relativeTime(row.updated_at)}</span>,
        },
        {
            key: 'actions',
            header: '',
            render: row => (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <Link href={route('serkep.show', row.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Lihat">
                        <Eye size={14} />
                    </Link>
                    <Link href={route('serkep.edit', row.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Edit">
                        <Pencil size={14} />
                    </Link>
                    <button type="button" onClick={() => handleDelete(row.id)} className="icon-btn" style={{ width: 28, height: 28, color: 'var(--rose-600)' }} title="Hapus">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
            align: 'right',
        },
    ]

    return (
        <AppLayout title="SERKEP">
            <PageHeader
                title="Tinjauan SERKEP"
                description="Surat Edaran Kepatuhan dalam alur drafting, kajian, hingga pengesahan."
                breadcrumbs={[{ label: 'Tinjauan Kepatuhan' }, { label: 'SERKEP' }]}
                actions={
                    <Link href={route('serkep.create')} className="btn primary">
                        <Plus size={14} /> Pengajuan SERKEP
                    </Link>
                }
            />

            <DataTable
                columns={columns}
                data={data}
                getRowKey={r => r.id}
                emptyMessage="Belum ada SERKEP."
                filters={
                    <ChipFilter
                        chips={STATUS_CHIPS.map(c => ({ ...c, active: activeStatus === c.value }))}
                        activeValue={activeStatus}
                        onSelect={v => { setActiveStatus(v); applyFilter({ status: v }) }}
                        trailing={trailingChips}
                    />
                }
            />

            {/* Inline search + jenis filter under chips */}
            <div style={{
                marginTop: 12,
                background: 'var(--paper)', border: '1px solid var(--ink-200)',
                borderRadius: 12, padding: 12,
                display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
            }}>
                <div className="global-search" style={{ flex: '1 1 280px', maxWidth: 360 }}>
                    <span className="ic"><Search size={14} /></span>
                    <input
                        placeholder="Cari nomor atau judul SERKEP…"
                        style={{ height: 32 }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                    />
                </div>
                <select
                    value={jenis}
                    onChange={e => { setJenis(e.target.value); applyFilter({ jenis_naskah: e.target.value }) }}
                    style={{
                        padding: '6px 12px', border: '1px solid var(--ink-200)',
                        borderRadius: 6, background: 'var(--paper)', fontSize: 13,
                    }}
                >
                    <option value="">Semua Jenis</option>
                    <option value="surat_edaran">Surat Edaran</option>
                    <option value="surat_keputusan">Surat Keputusan</option>
                    <option value="instruksi">Instruksi</option>
                    <option value="memo">Memo</option>
                </select>
            </div>

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
        </AppLayout>
    )
}
