import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Eye, Pencil, Trash2, Plus, Download, Search,
    CheckCircle, Clock, AlertTriangle, PlayCircle,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Donut from '@/Components/Donut'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import HBar from '@/Components/HBar'
import ChipFilter from '@/Components/ChipFilter'
import DataTable from '@/Components/DataTable'
import Avatar from '@/Components/Avatar'

const JENIS_LABEL = {
    regulasi: 'Regulasi',
    internal: 'Internal',
    audit:    'Audit',
    lainnya:  'Lainnya',
}

const STATUS_LABEL = {
    open:        'Open',
    in_progress: 'In Progress',
    completed:   'Completed',
    overdue:     'Overdue',
}
const STATUS_TONE = {
    open:        'draft',
    in_progress: 'review',
    completed:   'approve',
    overdue:     'rejected',
}

function fmtDate(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isOverdue(deadline, status) {
    if (!deadline || status === 'completed') return false
    return new Date(deadline) < new Date()
}

export default function KomitmenIndex({ commitments, filters, stats }) {
    const { data = [], links = [], meta = {} } = commitments ?? {}
    const [search, setSearch]   = useState(filters?.search ?? '')
    const [jenis, setJenis]     = useState(filters?.jenis ?? '')
    const [activeChip, setActiveChip] = useState(filters?.status ?? '')

    const counts = useMemo(() => ({
        all:         data.length,
        open:        data.filter(r => r.status === 'open').length,
        in_progress: data.filter(r => r.status === 'in_progress').length,
        completed:   data.filter(r => r.status === 'completed').length,
        overdue:     data.filter(r => r.status === 'overdue' || isOverdue(r.deadline, r.status)).length,
    }), [data])

    /* Donut center: completion percentage */
    const total      = data.length || 1
    const done       = counts.completed
    const inProgress = counts.in_progress
    const overdueCount = counts.overdue
    const completionPct = Math.round((done / total) * 100)

    /* Top 5 owners */
    const topOwners = useMemo(() => {
        if (stats?.top_owners) return stats.top_owners
        const map = new Map()
        data.forEach(r => {
            const k = r.pic_name ?? r.pic_user_id ?? 'Tanpa PIC'
            map.set(k, (map.get(k) ?? 0) + 1)
        })
        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }, [data, stats])
    const maxOwner = Math.max(...topOwners.map(o => o.count), 1)

    function applyFilter(overrides = {}) {
        router.get(route('commitments.index'), {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : activeChip,
            jenis:  overrides.jenis  !== undefined ? overrides.jenis  : jenis,
        }, { preserveState: true, replace: true })
    }

    function handleDelete(id) {
        if (!confirm('Hapus komitmen ini?')) return
        router.delete(route('commitments.destroy', id))
    }

    const chips = [
        { value: '',            label: 'Semua',       count: counts.all },
        { value: 'open',        label: 'Open',        count: counts.open },
        { value: 'in_progress', label: 'In Progress', count: counts.in_progress },
        { value: 'completed',   label: 'Completed',   count: counts.completed },
        { value: 'overdue',     label: 'Overdue',     count: counts.overdue },
    ]

    function onChipSelect(value) {
        setActiveChip(value)
        applyFilter({ status: value })
    }

    const trailingTools = (
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <select
                value={jenis}
                onChange={e => { setJenis(e.target.value); applyFilter({ jenis: e.target.value }) }}
                className="btn ghost sm"
                style={{ height: 32, padding: '0 10px' }}
            >
                <option value="">Semua Jenis</option>
                {Object.entries(JENIS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <div className="global-search" style={{ width: 240 }}>
                <span className="ic"><Search size={14} /></span>
                <input
                    placeholder="Cari komitmen…"
                    style={{ height: 32 }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                />
            </div>
        </div>
    )

    const columns = [
        {
            key: 'judul',
            header: 'Judul',
            render: r => (
                <Link href={route('commitments.show', r.id)} style={{ color: 'var(--ink-900)', fontWeight: 600, textDecoration: 'none' }}>
                    {r.judul ?? '—'}
                </Link>
            ),
            style: { maxWidth: 320 },
        },
        {
            key: 'jenis',
            header: 'Jenis',
            render: r => r.jenis ? <Tag tone={r.jenis === 'regulasi' ? 'brand' : r.jenis === 'audit' ? 'gold' : r.jenis === 'internal' ? 'info' : 'neutral'}>{JENIS_LABEL[r.jenis] ?? r.jenis}</Tag> : <span style={{ color: 'var(--ink-400)' }}>—</span>,
        },
        {
            key: 'deadline',
            header: 'Deadline',
            render: r => {
                const overdue = isOverdue(r.deadline, r.status)
                return (
                    <span style={{
                        color: overdue ? 'var(--rose-600)' : 'var(--ink-700)',
                        fontWeight: overdue ? 600 : 500,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 12,
                    }}>
                        {fmtDate(r.deadline)}
                        {overdue && <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600 }}>Terlambat</span>}
                    </span>
                )
            },
        },
        {
            key: 'progress',
            header: 'Progress',
            render: r => {
                const pct = Math.min(100, Math.max(0, Number(r.progress_pct) || 0))
                const color = pct >= 100 ? 'var(--brand-600)' : pct >= 60 ? 'var(--info-600)' : pct >= 30 ? 'var(--gold-500)' : 'var(--amber-600)'
                return <HBar value={pct} valueLabel={`${pct}%`} color={color} style={{ minWidth: 140 }} />
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: r => {
                const overdue = isOverdue(r.deadline, r.status)
                const tone = overdue ? 'rejected' : (STATUS_TONE[r.status] ?? 'draft')
                const label = overdue ? 'Overdue' : (STATUS_LABEL[r.status] ?? r.status)
                return <Badge status={tone} label={label} />
            },
        },
        {
            key: 'pic',
            header: 'PIC',
            render: r => r.pic_name ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={r.pic_name} size={26} tone="brand" />
                    <span style={{ fontSize: 12.5 }}>{r.pic_name}</span>
                </div>
            ) : <span style={{ color: 'var(--ink-400)' }}>—</span>,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: r => (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <Link href={route('commitments.show', r.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Lihat">
                        <Eye size={14} />
                    </Link>
                    <Link href={route('commitments.edit', r.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Edit">
                        <Pencil size={14} />
                    </Link>
                    <button onClick={() => handleDelete(r.id)} className="icon-btn" style={{ width: 28, height: 28, color: 'var(--rose-600)' }} title="Hapus">
                        <Trash2 size={14} />
                    </button>
                </div>
            ),
        },
    ]

    return (
        <AppLayout title="Komitmen Kepatuhan">
            <PageHeader
                title="Komitmen"
                description="Pantau dan kelola komitmen, kewajiban regulasi, serta tindak lanjut audit."
                breadcrumbs={[{ label: 'Monitoring' }, { label: 'Komitmen' }]}
                actions={
                    <>
                        <button type="button" className="btn ghost">
                            <Download size={14} /> Ekspor
                        </button>
                        <Link href={route('commitments.create')} className="btn primary">
                            <Plus size={14} /> Tambah Komitmen
                        </Link>
                    </>
                }
            />

            <div className="kpi-grid">
                <StatCard label="Open"        value={counts.open}        unit="item" icon={Clock}          tone="brand" />
                <StatCard label="In Progress" value={counts.in_progress} unit="item" icon={PlayCircle}     tone="info"  />
                <StatCard label="Overdue"     value={counts.overdue}     unit="item" icon={AlertTriangle}  tone="rose"  />
                <StatCard label="Completed"   value={counts.completed}   unit="item" icon={CheckCircle}    tone="brand" />
            </div>

            <div className="two-col" style={{ marginTop: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Pemenuhan Komitmen</h3>
                            <div className="sub">Status keseluruhan</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24 }}>
                        <Donut
                            size={160}
                            thickness={18}
                            segments={[
                                { value: done,         color: 'var(--brand-600)' },
                                { value: inProgress,   color: 'var(--info-600)' },
                                { value: overdueCount, color: 'var(--rose-600)' },
                                { value: counts.open,  color: 'var(--ink-200)' },
                            ]}
                            centerValue={`${completionPct}%`}
                            centerSub={`${done} of ${total} selesai`}
                        />
                        <div style={{ flex: 1, fontSize: 13, lineHeight: 1.7 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--brand-600)' }} />
                                <span style={{ flex: 1 }}>Completed</span>
                                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{done}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--info-600)' }} />
                                <span style={{ flex: 1 }}>In Progress</span>
                                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{inProgress}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--rose-600)' }} />
                                <span style={{ flex: 1 }}>Overdue</span>
                                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{overdueCount}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--ink-200)' }} />
                                <span style={{ flex: 1 }}>Open</span>
                                <span style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{counts.open}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Top 5 Pemilik Komitmen</h3>
                            <div className="sub">Volume per PIC</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {topOwners.length === 0 ? (
                            <p style={{ color: 'var(--ink-500)', fontSize: 13 }}>Belum ada PIC tertaut.</p>
                        ) : topOwners.map((o, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar name={o.name} size={28} tone={i === 0 ? 'brand' : i === 1 ? 'gold' : i === 2 ? 'info' : 'rose'} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{o.name}</div>
                                    <HBar value={o.count} max={maxOwner} height={4} color="var(--brand-500)" />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', minWidth: 28, textAlign: 'right' }}>{o.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 16 }}>
                <DataTable
                    title="Daftar Komitmen"
                    subtitle={`${data.length} komitmen terdaftar`}
                    columns={columns}
                    data={data}
                    getRowKey={r => r.id}
                    emptyMessage="Tidak ada komitmen."
                    filters={
                        <ChipFilter
                            chips={chips}
                            activeValue={activeChip}
                            onSelect={onChipSelect}
                            trailing={trailingTools}
                        />
                    }
                />
            </div>

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
                            {meta.from}–{meta.to} dari {meta.total}
                        </span>
                    )}
                </div>
            )}
        </AppLayout>
    )
}
