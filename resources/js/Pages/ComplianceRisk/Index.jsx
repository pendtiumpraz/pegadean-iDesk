import { useState, useMemo } from 'react'
import { Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Eye, Pencil, Trash2, Archive, Plus, Search,
    AlertTriangle, ShieldCheck, Clock, CheckCircle,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import StatCard from '@/Components/StatCard'
import Badge from '@/Components/Badge'
import Tag from '@/Components/Tag'
import ChipFilter from '@/Components/ChipFilter'
import DataTable from '@/Components/DataTable'
import Avatar from '@/Components/Avatar'

/* ── constants ── */
const KATEGORI_OPTIONS = ['Operasional', 'Compliance', 'Reputasi', 'Strategis', 'Finansial']

const STATUS_LABEL = {
    open:        'Open',
    mitigated:   'Termitigasi',
    accepted:    'Pemantauan',
    closed:      'Closed',
}

/* ── helpers ── */
function pillStyle(score) {
    if (score >= 20) return { bg: 'var(--rose-600)',  fg: '#fff' }
    if (score >= 13) return { bg: 'var(--rose-100)',  fg: 'var(--rose-600)'  }
    if (score >= 7)  return { bg: 'var(--amber-100)', fg: 'var(--amber-600)' }
    return            { bg: 'var(--brand-100)', fg: 'var(--brand-700)' }
}

function ScorePill({ l, i }) {
    const score = (Number(l) || 0) * (Number(i) || 0)
    const tone  = pillStyle(score)
    return (
        <span
            className="pill"
            style={{
                background: tone.bg, color: tone.fg,
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                minWidth: 28, justifyContent: 'center',
            }}
        >
            {score || '—'}
        </span>
    )
}

function bandColor(count) {
    if (count >= 14) return 'var(--rose-600)'
    if (count >= 10) return 'var(--amber-600)'
    if (count >= 6)  return 'var(--gold-500)'
    return 'var(--brand-500)'
}

export default function RisikoKepatuhanIndex({ risks, filters, stats }) {
    const { data = [], links = [], meta = {} } = risks ?? {}
    const [search, setSearch]     = useState(filters?.search ?? '')
    const [activeChip, setActiveChip] = useState(filters?.status ?? '')

    /* ── KPI numbers (use props, fall back to derived) ── */
    const kpi = useMemo(() => {
        const tinggi = data.filter(r => (r.residual_likelihood ?? 0) * (r.residual_impact ?? 0) >= 13).length
        const sedang = data.filter(r => {
            const s = (r.residual_likelihood ?? 0) * (r.residual_impact ?? 0)
            return s >= 7 && s < 13
        }).length
        return {
            tinggi:    stats?.tinggi    ?? tinggi,
            sedang:    stats?.sedang    ?? sedang,
            efektifitas: stats?.efektifitas ?? 87,
            tertunda:  stats?.tertunda  ?? 6,
        }
    }, [data, stats])

    /* ── chip counts ── */
    const counts = useMemo(() => ({
        all:         data.length,
        high:        data.filter(r => (r.residual_likelihood ?? 0) * (r.residual_impact ?? 0) >= 13).length,
        med:         data.filter(r => {
            const s = (r.residual_likelihood ?? 0) * (r.residual_impact ?? 0)
            return s >= 7 && s < 13
        }).length,
        low:         data.filter(r => (r.residual_likelihood ?? 0) * (r.residual_impact ?? 0) < 7).length,
        mitigated:   data.filter(r => r.status === 'mitigated').length,
        closed:      data.filter(r => r.status === 'closed').length,
    }), [data])

    /* ── divisi × kategori heatmap (synthetic if no aggregate prop) ── */
    const heatmap = stats?.heatmap ?? [
        ['Bisnis Gadai',          [14, 8, 11, 5, 7],  45],
        ['Bisnis Mikro & Mitra',  [10, 12, 7, 6, 5],  40],
        ['Treasury',              [6, 11, 4, 4, 5],   30],
        ['Manajemen Risiko',      [12, 9, 8, 5, 4],   38],
        ['Anti Fraud',            [5, 8, 15, 3, 4],   35],
        ['Operasional Cabang',    [18, 7, 9, 6, 8],   48],
    ]
    const heatmapCols = ['Operasional', 'Compliance', 'Reputasi', 'Strategis', 'Finansial']

    /* ── kategori distribusi ── */
    const kategoriBars = stats?.kategori ?? [
        { label: 'Operasional', count: 8, color: 'var(--brand-600)' },
        { label: 'Compliance',  count: 5, color: 'var(--gold-500)'  },
        { label: 'Reputasi',    count: 4, color: 'var(--rose-600)'  },
        { label: 'Strategis',   count: 3, color: 'var(--info-600)'  },
        { label: 'Finansial',   count: 2, color: 'var(--amber-600)' },
    ]
    const maxKategori = Math.max(...kategoriBars.map(k => k.count), 1)

    function applyFilter(overrides = {}) {
        router.get(route('risks.index'), {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : activeChip,
        }, { preserveState: true, replace: true })
    }

    function handleDelete(id) {
        if (!confirm('Hapus risiko ini? Data akan diarsipkan (soft delete).')) return
        router.delete(route('risks.destroy', id))
    }

    /* ── chips ── */
    const chips = [
        { value: '',          label: 'Semua',       count: counts.all },
        { value: 'high',      label: 'Tinggi',      count: counts.high },
        { value: 'med',       label: 'Sedang',      count: counts.med },
        { value: 'low',       label: 'Rendah',      count: counts.low },
        { value: 'mitigated', label: 'Termitigasi', count: counts.mitigated },
        { value: 'closed',    label: 'Closed',      count: counts.closed },
    ]

    function onChipSelect(value) {
        setActiveChip(value)
        applyFilter({ status: value })
    }

    const trailingSearch = (
        <div className="global-search" style={{ width: 280 }}>
            <span className="ic"><Search size={14} /></span>
            <input
                placeholder="Cari kode atau nama risiko…"
                style={{ height: 32 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
            />
        </div>
    )

    /* ── table columns ── */
    const columns = [
        {
            key: 'kode_risiko',
            header: 'Kode',
            render: r => <span className="doc-id">{r.kode_risiko ?? '—'}</span>,
        },
        {
            key: 'nama_risiko',
            header: 'Nama Risiko',
            render: r => (
                <Link href={route('risks.show', r.id)} style={{ color: 'var(--ink-900)', fontWeight: 600, textDecoration: 'none' }}>
                    {r.nama_risiko ?? '—'}
                </Link>
            ),
            style: { maxWidth: 300 },
        },
        {
            key: 'kategori',
            header: 'Kategori',
            render: r => r.kategori ? <Tag>{r.kategori}</Tag> : <span style={{ color: 'var(--ink-400)' }}>—</span>,
        },
        {
            key: 'inherent',
            header: 'Inherent',
            render: r => <ScorePill l={r.inherent_likelihood} i={r.inherent_impact} />,
        },
        {
            key: 'residual',
            header: 'Residual',
            render: r => <ScorePill l={r.residual_likelihood} i={r.residual_impact} />,
        },
        {
            key: 'status',
            header: 'Status',
            render: r => <Badge status={r.status === 'mitigated' ? 'termitigasi' : r.status === 'accepted' ? 'pemantauan' : r.status === 'closed' ? 'selesai' : 'draft'} label={STATUS_LABEL[r.status] ?? r.status} />,
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
                    <Link href={route('risks.show', r.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Lihat">
                        <Eye size={14} />
                    </Link>
                    <Link href={route('risks.edit', r.id)} className="icon-btn" style={{ width: 28, height: 28 }} title="Edit">
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
        <AppLayout title="Risiko Kepatuhan">
            <PageHeader
                title="Risiko Kepatuhan"
                description="Risk Control Self-Assessment terintegrasi dengan BeComply & RCS — kelola register risiko kepatuhan."
                breadcrumbs={[{ label: 'Monitoring' }, { label: 'Risiko Kepatuhan' }]}
                actions={
                    <>
                        <Link href={route('risks.index', { trashed: 1 })} className="btn ghost">
                            <Archive size={14} /> Lihat Arsip
                        </Link>
                        <Link href={route('risks.create')} className="btn primary">
                            <Plus size={14} /> Tambah Risiko
                        </Link>
                    </>
                }
            />

            {/* KPI grid */}
            <div className="kpi-grid">
                <StatCard
                    label="Risiko Tinggi"
                    value={kpi.tinggi}
                    unit="aktif"
                    icon={AlertTriangle}
                    tone="rose"
                />
                <StatCard
                    label="Risiko Sedang"
                    value={kpi.sedang}
                    unit="aktif"
                    icon={AlertTriangle}
                    tone="amber"
                />
                <StatCard
                    label="Efektivitas Kontrol"
                    value={kpi.efektifitas}
                    unit="%"
                    icon={ShieldCheck}
                    tone="brand"
                    delta="▲ 3pp"
                    deltaTone="up"
                    deltaLabel="Q1 → Q2"
                />
                <StatCard
                    label="Mitigasi Tertunda"
                    value={kpi.tertunda}
                    unit="item"
                    icon={Clock}
                    tone="gold"
                    deltaLabel="2 melewati target"
                />
            </div>

            {/* Heatmap + Kategori */}
            <div className="three-col" style={{ marginTop: 16 }}>
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-head">
                        <div>
                            <h3>Heatmap per Divisi</h3>
                            <div className="sub">Skor agregat dari RCS</div>
                        </div>
                    </div>
                    <div className="card-body">
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4, fontSize: 12 }}>
                            <thead>
                                <tr style={{ color: 'var(--ink-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                                    <th style={{ textAlign: 'left', padding: '6px 8px' }}>Divisi</th>
                                    {heatmapCols.map(c => (
                                        <th key={c} style={{ padding: '6px 8px' }}>{c}</th>
                                    ))}
                                    <th style={{ padding: '6px 8px' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {heatmap.map((row, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row[0]}</td>
                                        {row[1].map((v, j) => (
                                            <td
                                                key={j}
                                                style={{
                                                    background: bandColor(v),
                                                    opacity: 0.4 + v / 25,
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    padding: '10px 8px',
                                                    borderRadius: 4,
                                                    fontFamily: 'JetBrains Mono, monospace',
                                                }}
                                            >
                                                {v}
                                            </td>
                                        ))}
                                        <td style={{ padding: '6px 8px', fontWeight: 600, textAlign: 'center', background: 'var(--ink-50)', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                                            {row[2]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, fontSize: 11.5, color: 'var(--ink-500)' }}>
                            <span>Skor risiko (likelihood × impact):</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 12, background: 'var(--brand-500)', borderRadius: 3 }} /> &lt;6</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 12, background: 'var(--gold-500)', borderRadius: 3 }} /> 6–9</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 12, background: 'var(--amber-600)', borderRadius: 3 }} /> 10–13</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 12, background: 'var(--rose-600)', borderRadius: 3 }} /> ≥14</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Kategori Risiko</h3>
                            <div className="sub">Distribusi register</div>
                        </div>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {kategoriBars.map((c, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ fontWeight: 500 }}>{c.label}</span>
                                    <span style={{ color: 'var(--ink-500)', fontFamily: 'JetBrains Mono, monospace' }}>{c.count} risiko</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ width: `${(c.count / maxKategori) * 100}%`, height: '100%', background: c.color, borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* DataTable */}
            <div style={{ marginTop: 16 }}>
                <DataTable
                    title="Daftar Risiko Aktif"
                    subtitle={`${data.length} risiko terdaftar — RCS Risk Register`}
                    columns={columns}
                    data={data}
                    getRowKey={r => r.id}
                    emptyMessage="Tidak ada data risiko."
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
                            {meta.from}–{meta.to} dari {meta.total}
                        </span>
                    )}
                </div>
            )}
        </AppLayout>
    )
}
