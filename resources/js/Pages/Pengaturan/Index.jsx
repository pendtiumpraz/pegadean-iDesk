import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Save, User, Users, Sparkles, Bell, Shield, Palette, History,
    Search, Eye, Pencil, Trash2, CheckCircle2, XCircle, Send,
    Plus, Download, FileText,
} from 'lucide-react'
import AppLayout from '@/Layouts/AppLayout'
import PageHeader from '@/Components/PageHeader'
import ChipFilter from '@/Components/ChipFilter'
import Avatar from '@/Components/Avatar'
import Tag from '@/Components/Tag'

/* Tabs definition — must align with `setting.group` values */
const TABS = [
    { key: 'profile',     label: 'Profil & Akun',  icon: User,    description: 'Informasi yang ditampilkan kepada anggota tim Anda.' },
    { key: 'team',        label: 'Tim & Peran',    icon: Users,   description: 'Atur peran, undang anggota, dan kelola hak akses.' },
    { key: 'ai',          label: 'AI Co-pilot',    icon: Sparkles,description: 'Konfigurasi perilaku AI dalam alur tinjauan kepatuhan.' },
    { key: 'notif',       label: 'Notifikasi',     icon: Bell,    description: 'Pilih cara Anda diberitahu.' },
    { key: 'security',    label: 'Keamanan',       icon: Shield,  description: 'Multi-factor authentication & sesi aktif.' },
    { key: 'appearance',  label: 'Tampilan',       icon: Palette, description: 'Sesuaikan tema warna, kepadatan, dan preferensi visual.' },
    { key: 'audit',       label: 'Audit Trail',    icon: History, description: 'Catatan tidak dapat diubah — semua aksi tercatat.' },
]

/* ── inputs ── */
const inputBase = {
    width: '100%', padding: '8px 12px', border: '1px solid var(--ink-200)',
    borderRadius: 8, background: 'var(--paper)', fontSize: 13.5,
    color: 'var(--ink-900)', outline: 'none', boxSizing: 'border-box',
}

function Toggle({ checked, onChange }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            style={{
                width: 38, height: 22, borderRadius: 11,
                background: checked ? 'var(--brand-600)' : 'var(--ink-300)',
                position: 'relative', cursor: 'pointer', flex: 'none',
                transition: 'background .2s',
            }}
        >
            <span
                style={{
                    position: 'absolute', top: 2, left: checked ? 18 : 2,
                    width: 18, height: 18, background: '#fff',
                    borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left .2s',
                }}
            />
        </div>
    )
}

function SettingRow({ setting, value, onChange }) {
    if (setting.type === 'boolean') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--ink-100)' }}>
                <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{setting.label ?? setting.key}</div>
                    {setting.description && (
                        <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{setting.description}</div>
                    )}
                </div>
                <Toggle checked={Boolean(value)} onChange={v => onChange(setting.key, v)} />
            </div>
        )
    }

    return (
        <div style={{ padding: '14px 0', borderBottom: '1px solid var(--ink-100)' }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 4 }}>
                {setting.label ?? setting.key}
            </label>
            {setting.description && (
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginBottom: 6 }}>{setting.description}</div>
            )}
            {setting.type === 'integer' && (
                <input
                    type="number"
                    style={inputBase}
                    value={value}
                    onChange={e => onChange(setting.key, e.target.value === '' ? '' : Number(e.target.value))}
                />
            )}
            {setting.type === 'json' && (
                <textarea
                    rows={5}
                    style={{ ...inputBase, fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, resize: 'vertical' }}
                    value={value}
                    onChange={e => onChange(setting.key, e.target.value)}
                />
            )}
            {(setting.type === 'string' || !setting.type) && (
                <input
                    type="text"
                    style={inputBase}
                    value={value}
                    onChange={e => onChange(setting.key, e.target.value)}
                />
            )}
        </div>
    )
}

function parseInitial(items) {
    const out = {}
    for (const s of items) {
        if (s.type === 'boolean') {
            out[s.key] = s.value === 'true' || s.value === true || s.value === '1'
        } else if (s.type === 'integer') {
            out[s.key] = s.value !== null && s.value !== '' ? Number(s.value) : ''
        } else {
            out[s.key] = s.value ?? ''
        }
    }
    return out
}

/* ── Audit Trail helpers ── */
const ACTION_META = {
    created:   { icon: Plus,         tone: 'brand', label: 'Created'   },
    updated:   { icon: Pencil,       tone: 'info',  label: 'Updated'   },
    deleted:   { icon: Trash2,       tone: 'rose',  label: 'Deleted'   },
    viewed:    { icon: Eye,          tone: 'ink',   label: 'Viewed'    },
    approved:  { icon: CheckCircle2, tone: 'brand', label: 'Approved'  },
    rejected:  { icon: XCircle,      tone: 'rose',  label: 'Rejected'  },
    submitted: { icon: Send,         tone: 'gold',  label: 'Submitted' },
    exported:  { icon: Download,     tone: 'amber', label: 'Exported'  },
}

function formatTimestamp(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function AuditTrailPanel({ trails = [] }) {
    const [filterAction, setFilterAction] = useState('all')
    const [search, setSearch]             = useState('')

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return trails.filter((t) => {
            if (filterAction !== 'all' && t.action !== filterAction) return false
            if (!q) return true
            const hay = `${t.actor_name ?? ''} ${t.entity_name ?? ''} ${t.entity_type ?? ''} ${t.description ?? ''}`.toLowerCase()
            return hay.includes(q)
        })
    }, [trails, filterAction, search])

    const counts = useMemo(() => {
        const c = { all: trails.length }
        for (const t of trails) c[t.action] = (c[t.action] ?? 0) + 1
        return c
    }, [trails])

    const chips = [
        { value: 'all',       label: 'Semua',     count: counts.all       },
        { value: 'created',   label: 'Created',   count: counts.created   ?? 0 },
        { value: 'updated',   label: 'Updated',   count: counts.updated   ?? 0 },
        { value: 'deleted',   label: 'Deleted',   count: counts.deleted   ?? 0 },
        { value: 'approved',  label: 'Approved',  count: counts.approved  ?? 0 },
        { value: 'submitted', label: 'Submitted', count: counts.submitted ?? 0 },
    ]

    return (
        <>
            <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 20, fontWeight: 500, margin: '0 0 4px' }}>
                Audit Trail Aktivitas Sistem
            </h3>
            <div style={{ color: 'var(--ink-500)', fontSize: 13, marginBottom: 20 }}>
                Catatan tidak dapat diubah — semua aksi tercatat sesuai standar GCG.
            </div>

            <ChipFilter
                chips={chips}
                activeValue={filterAction}
                onSelect={(v) => setFilterAction(v)}
                trailing={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: '1px solid var(--ink-200)', borderRadius: 8, background: 'var(--paper)' }}>
                        <Search size={14} style={{ color: 'var(--ink-500)' }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari entitas atau pengguna…"
                            style={{ border: 0, outline: 'none', fontSize: 12.5, width: 220, background: 'transparent' }}
                        />
                    </div>
                }
            />

            <div style={{ marginTop: 16, position: 'relative', paddingLeft: 24 }}>
                <span style={{
                    position: 'absolute', left: 8, top: 6, bottom: 6,
                    width: 1, background: 'var(--ink-200)',
                }} />
                {filtered.length === 0 && (
                    <div style={{
                        background: 'var(--ink-50)', border: '1px dashed var(--ink-200)',
                        borderRadius: 10, padding: 24, textAlign: 'center',
                        color: 'var(--ink-500)', fontSize: 13,
                    }}>
                        Tidak ada catatan audit yang cocok.
                    </div>
                )}
                {filtered.map((t, i) => {
                    const meta = ACTION_META[t.action] ?? { icon: FileText, tone: 'ink', label: t.action }
                    const Icon = meta.icon
                    const dotColor =
                        meta.tone === 'rose'  ? 'var(--rose-600)'  :
                        meta.tone === 'amber' ? 'var(--amber-600)' :
                        meta.tone === 'gold'  ? 'var(--gold-600)'  :
                        meta.tone === 'info'  ? 'var(--info-600)'  :
                        meta.tone === 'ink'   ? 'var(--ink-300)'   : 'var(--brand-500)'
                    const isSystem = t.actor_type === 'system'
                    return (
                        <div key={t.id ?? i} style={{
                            position: 'relative',
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '12px 0', borderBottom: '1px solid var(--ink-100)',
                        }}>
                            <span style={{
                                position: 'absolute', left: -22, top: 14,
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'var(--paper)', border: `2px solid ${dotColor}`,
                                display: 'grid', placeItems: 'center',
                            }}>
                                <Icon size={10} style={{ color: dotColor }} />
                            </span>
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 11.5, color: 'var(--ink-500)',
                                minWidth: 130, paddingTop: 4,
                            }}>{formatTimestamp(t.created_at)}</span>
                            <Avatar
                                name={t.actor_name}
                                size={28}
                                tone={isSystem ? 'info' : 'brand'}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                                    <span style={{ fontWeight: 600 }}>{t.actor_name}</span>
                                    <Tag tone={meta.tone} size="sm">{meta.label}</Tag>
                                    <span style={{ color: 'var(--ink-500)' }}>→</span>
                                    <span style={{ fontWeight: 500 }}>{t.entity_name ?? t.entity_id}</span>
                                    <Tag size="sm">{t.entity_type}</Tag>
                                </div>
                                {t.description && (
                                    <div style={{ fontSize: 12.5, color: 'var(--ink-700)', marginTop: 4 }}>{t.description}</div>
                                )}
                                {t.ip_address && (
                                    <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                                        IP {t.ip_address}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default function PengaturanIndex({ settings = [], audit_trails = [] }) {
    const [activeTab, setActiveTab] = useState(TABS[0].key)

    /* group settings by `setting.group` */
    const grouped = useMemo(() => {
        const map = {}
        for (const s of settings) {
            const g = s.group ?? 'profile'
            if (!map[g]) map[g] = []
            map[g].push(s)
        }
        return map
    }, [settings])

    /* state per tab — keyed by tab.key */
    const [valuesByTab, setValuesByTab] = useState(() => {
        const m = {}
        for (const t of TABS) {
            m[t.key] = parseInitial(grouped[t.key] ?? [])
        }
        return m
    })

    const [savingTab, setSavingTab] = useState(null)
    const [savedTab, setSavedTab]   = useState(null)

    function setValue(tab, key, val) {
        setValuesByTab(prev => ({
            ...prev,
            [tab]: { ...prev[tab], [key]: val },
        }))
        setSavedTab(null)
    }

    function handleSave(tabKey) {
        const tabSettings = grouped[tabKey] ?? []
        const values = valuesByTab[tabKey] ?? {}
        const payload = tabSettings.map(s => ({
            key: s.key,
            value: String(values[s.key] ?? ''),
        }))

        setSavingTab(tabKey)
        router.put(
            route('settings.update'),
            { settings: payload },
            {
                preserveState: true,
                onFinish: () => {
                    setSavingTab(null)
                    setSavedTab(tabKey)
                    setTimeout(() => setSavedTab(null), 2500)
                },
            }
        )
    }

    const activeMeta = TABS.find(t => t.key === activeTab) ?? TABS[0]
    const activeSettings = grouped[activeTab] ?? []

    return (
        <AppLayout title="Pengaturan">
            <PageHeader
                title="Pengaturan"
                description="Kelola profil, peran, kebijakan AI, dan preferensi tampilan iDesk."
                breadcrumbs={[{ label: 'Sistem' }, { label: 'Pengaturan' }]}
            />

            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 520 }}>
                    {/* Sidebar */}
                    <div style={{ borderRight: '1px solid var(--ink-200)', background: 'var(--ink-50)', padding: 12 }}>
                        {TABS.map(t => {
                            const Icon = t.icon
                            const isActive = activeTab === t.key
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() => setActiveTab(t.key)}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 12px', marginBottom: 2,
                                        borderRadius: 8, width: '100%',
                                        background: isActive ? 'var(--paper)' : 'transparent',
                                        color: isActive ? 'var(--brand-700)' : 'var(--ink-700)',
                                        border: isActive ? '1px solid var(--ink-200)' : '1px solid transparent',
                                        fontSize: 13, fontWeight: isActive ? 600 : 500,
                                        cursor: 'pointer', textAlign: 'left',
                                    }}
                                >
                                    <Icon size={16} />
                                    <span>{t.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Content pane */}
                    <div style={{ padding: 28 }}>
                        {activeTab === 'audit' ? (
                            <AuditTrailPanel trails={audit_trails} />
                        ) : (
                        <>
                        <h3 style={{ fontFamily: "'IBM Plex Serif', Georgia, serif", fontSize: 20, fontWeight: 500, margin: '0 0 4px' }}>
                            {activeMeta.label}
                        </h3>
                        <div style={{ color: 'var(--ink-500)', fontSize: 13, marginBottom: 24 }}>
                            {activeMeta.description}
                        </div>

                        {activeSettings.length === 0 ? (
                            <div style={{
                                background: 'var(--ink-50)', border: '1px dashed var(--ink-200)',
                                borderRadius: 10, padding: 32, textAlign: 'center',
                                color: 'var(--ink-500)', fontSize: 13,
                            }}>
                                Belum ada pengaturan untuk bagian ini.
                            </div>
                        ) : (
                            <>
                                {activeSettings.map(s => (
                                    <SettingRow
                                        key={s.key}
                                        setting={s}
                                        value={valuesByTab[activeTab]?.[s.key] ?? ''}
                                        onChange={(k, v) => setValue(activeTab, k, v)}
                                    />
                                ))}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-200)' }}>
                                    {savedTab === activeTab && (
                                        <span style={{ fontSize: 12.5, color: 'var(--brand-700)' }}>Tersimpan!</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleSave(activeTab)}
                                        disabled={savingTab === activeTab}
                                        className="btn primary"
                                    >
                                        <Save size={14} />
                                        {savingTab === activeTab ? 'Menyimpan…' : 'Simpan perubahan'}
                                    </button>
                                </div>
                            </>
                        )}
                        </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
