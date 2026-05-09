import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Eye, Send, Plus, Search, FileText, AlertOctagon } from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Sparkline from '@/Components/Sparkline'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import ChipFilter from '@/Components/ChipFilter'
import DataTable from '@/Components/DataTable'

const STATUS_LABEL = {
    draft:     'Draft',
    review:    'Review',
    submitted: 'Submitted',
    rejected:  'Rejected',
}
const STATUS_TONE = {
    draft:     'draft',
    review:    'review',
    submitted: 'approve',
    rejected:  'rejected',
}

function fmt(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCurrency(val) {
    if (!val && val !== 0) return '—'
    return Number(val).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
}

export default function StrIndex({ strs, filters, stats }) {
    const { data = [], links = [], meta = {} } = strs ?? {}
    const [search, setSearch] = useState(filters?.search ?? '')
    const [activeChip, setActiveChip] = useState(filters?.status ?? '')

    const counts = useMemo(() => ({
        all:       data.length,
        draft:     data.filter(r => r.status === 'draft').length,
        review:    data.filter(r => r.status === 'review').length,
        submitted: data.filter(r => r.status === 'submitted').length,
        rejected:  data.filter(r => r.status === 'rejected').length,
    }), [data])

    const submittedSpark = stats?.submitted_spark ?? [4, 6, 5, 8, 12, 10, 14, 16, 18]

    function applyFilter(overrides = {}) {
        router.get(route('str.index'), {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : activeChip,
        }, { preserveState: true, replace: true })
    }

    function handleSubmit(id) {
        if (!confirm('Submit STR ini ke PPATK? Tindakan ini tidak dapat dibatalkan.')) return
        router.post(route('str.submit', id))
    }

    const chips = [
        { value: '',           label: 'Semua',     count: counts.all },
        { value: 'draft',      label: 'Draft',     count: counts.draft },
        { value: 'review',     label: 'Review',    count: counts.review },
        { value: 'submitted',  label: 'Submitted', count: counts.submitted },
        { value: 'rejected',   label: 'Rejected',  count: counts.rejected },
    ]

    function onChipSelect(value) {
        setActiveChip(value)
        applyFilter({ status: value })
    }

    const trailingSearch = (
        <div className="global-search" style={{ width: 280 }}>
            <span className="ic"><Search size={14} /></span>
            <input
                placeholder="Cari nomor STR atau nasabah…"
                style={{ height: 32 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
            />
        </div>
    )

    const columns = [
        {
            key: 'nomor_str',
            header: 'Nomor STR',
            render: r => <span className="doc-id">{r.nomor_str ?? '—'}</span>,
        },
        {
            key: 'nasabah',
            header: 'Nasabah',
            render: r => (
                <div>
                    <div style={{ fontWeight: 600 }}>{r.nasabah_nama ?? '—'}</div>
                    {r.nasabah_nik && (
                        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                            {r.nasabah_nik}
                        </div>
                    )}
                </div>
            ),
            style: { maxWidth: 240 },
        },
        {
            key: 'jumlah_transaksi',
            header: 'Jumlah Transaksi',
            render: r => (
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {fmtCurrency(r.jumlah_transaksi)}
                </span>
            ),
        },
        {
            key: 'tanggal_transaksi',
            header: 'Tgl Transaksi',
            render: r => <span style={{ color: 'var(--ink-500)' }}>{fmt(r.tanggal_transaksi)}</span>,
        },
        {
            key: 'indikasi',
            header: 'Indikasi',
            render: r => r.indikasi ? (
                <Tag tone="amber">{String(r.indikasi).slice(0, 28)}{String(r.indikasi).length > 28 ? '…' : ''}</Tag>
            ) : <span style={{ color: 'var(--ink-400)' }}>—</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: r => <Badge status={STATUS_TONE[r.status] ?? 'draft'} label={STATUS_LABEL[r.status] ?? r.status} />,
        },
        {
            key: 'submitted_at',
            header: 'Submitted',
            render: r => <span style={{ color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5 }}>{fmt(r.submitted_at)}</span>,
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            render: r => (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <Link href={route('str.show', r.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Lihat">
                        <Eye size={14} />
                    </Link>
                    {r.status === 'review' && (
                        <button
                            onClick={() => handleSubmit(r.id)}
                            className="icon-btn"
                            style={{ width: 28, height: 28, color: 'var(--brand-700)' }}
                            title="Submit ke PPATK"
                        >
                            <Send size={14} />
                        </button>
                    )}
                </div>
            ),
        },
    ]

    return (
        <AppLayout title="STR — Suspicious Transaction Reports">
            <PageHeader
                title="STR (Suspicious Transaction Reports)"
                description="Anti Pencucian Uang — kelola dan submit laporan STR ke PPATK."
                breadcrumbs={[{ label: 'Monitoring' }, { label: 'STR' }]}
                actions={
                    <Link href={route('str.create')} className="btn primary">
                        <Plus size={14} /> Tambah STR
                    </Link>
                }
            />

            <div className="kpi-grid">
                <StatCard
                    label="STR Draft"
                    value={counts.draft ?? 0}
                    unit="dokumen"
                    icon={FileText}
                    tone="brand"
                />
                <StatCard
                    label="STR Review"
                    value={counts.review ?? 0}
                    unit="menunggu"
                    icon={AlertOctagon}
                    tone="amber"
                />
                <StatCard
                    label="STR Submitted"
                    value={counts.submitted ?? 0}
                    unit="dikirim"
                    icon={Send}
                    tone="info"
                    deltaLabel="7 hari terakhir"
                >
                    <Sparkline
                        data={submittedSpark}
                        width={120}
                        height={28}
                        color="var(--info-600)"
                        style={{ marginTop: 8 }}
                    />
                </StatCard>
                <StatCard
                    label="STR Rejected"
                    value={counts.rejected ?? 0}
                    unit="ditolak"
                    icon={AlertOctagon}
                    tone="rose"
                />
            </div>

            <div style={{ marginTop: 16 }}>
                <DataTable
                    title="Daftar Laporan STR"
                    subtitle={`${data.length} laporan terdaftar`}
                    columns={columns}
                    data={data}
                    getRowKey={r => r.id}
                    emptyMessage="Tidak ada laporan STR."
                    filters={
                        <ChipFilter
                            chips={chips}
                            activeValue={activeChip}
                            onSelect={onChipSelect}
                            trailing={trailingSearch}
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
