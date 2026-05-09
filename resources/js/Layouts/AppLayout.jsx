import { useState, useEffect } from 'react'
import { usePage, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
    Home,
    Inbox,
    FileSearch,
    FileText,
    BookOpen,
    BarChart3,
    AlertOctagon,
    ShieldAlert,
    Link2,
    Settings,
    Sparkles,
    History,
    Bell,
    ChevronDown,
    LogOut,
    X,
    CheckCircle,
    AlertCircle,
    Info,
} from 'lucide-react'
import AISearchModal from '@/Components/AISearchModal'

/**
 * Sidebar nav structure mirrors shell.jsx (sectioned).
 * routeName is used for active-state matching against ziggy.
 */
const NAV_SECTIONS = [
    { type: 'sec', label: 'Beranda' },
    { type: 'item', id: 'dashboard',  label: 'Dashboard',                 icon: Home,         href: '/',                  routeName: 'dashboard' },
    { type: 'item', id: 'disposisi',  label: 'Disposisi & Persetujuan',   icon: Inbox,        href: '/disposisi',         routeName: 'disposisi.*' },

    { type: 'sec', label: 'Tinjauan Kepatuhan' },
    { type: 'item', id: 'serkep',     label: 'Tinjauan SERKEP',           icon: FileSearch,   href: '/serkep',            routeName: 'serkep.*' },
    { type: 'item', id: 'tugas',      label: 'Tugas Review',              icon: FileText,     href: '/tugas-review',      routeName: 'tugas-review.*' },
    { type: 'item', id: 'ai-review',  label: 'AI Review',                 icon: Sparkles,     href: '/ai-review',         routeName: 'ai-review.*' },

    { type: 'sec', label: 'Repository & Monitoring' },
    { type: 'item', id: 'kebijakan',  label: 'Repository Kebijakan',      icon: BookOpen,     href: '/kebijakan',         routeName: 'kebijakan.*' },
    { type: 'item', id: 'risiko',     label: 'Compliance Risk',           icon: AlertOctagon, href: '/risiko-kepatuhan',  routeName: 'risiko-kepatuhan.*' },
    { type: 'item', id: 'aml',        label: 'APU PPT / AML-CFT',         icon: ShieldAlert,  href: '/aml-alerts',        routeName: 'aml-alerts.*' },
    { type: 'item', id: 'str',        label: 'Pelaporan STR',             icon: BarChart3,    href: '/str',               routeName: 'str.*' },
    { type: 'item', id: 'komitmen',   label: 'Komitmen',                  icon: Link2,        href: '/komitmen',          routeName: 'komitmen.*' },
    { type: 'item', id: 'monitoring', label: 'Monitoring',                icon: BarChart3,    href: '/monitoring',        routeName: 'monitoring.*' },

    { type: 'sec', label: 'Sistem' },
    { type: 'item', id: 'integrasi',  label: 'Integrasi',                 icon: Link2,        href: '/integrasi',         routeName: 'integrations.*' },
    { type: 'item', id: 'settings',   label: 'Pengaturan',                icon: Settings,     href: '/pengaturan',        routeName: 'pengaturan.*' },
]

function isActive(routeName, href) {
    try {
        if (routeName && route().current(routeName)) return true
    } catch { /* ignore */ }
    if (typeof window === 'undefined') return false
    if (href === '/') return window.location.pathname === '/'
    return window.location.pathname.startsWith(href)
}

function initials(name) {
    if (!name) return 'U'
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'U'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Toast({ flash }) {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const next = []
        if (flash?.success) next.push({ id: 'success', type: 'success', message: flash.success })
        if (flash?.error)   next.push({ id: 'error',   type: 'error',   message: flash.error })
        if (flash?.warning) next.push({ id: 'warning', type: 'warning', message: flash.warning })
        if (next.length === 0) return

        setToasts(next)
        const timer = setTimeout(() => setToasts([]), 4000)
        return () => clearTimeout(timer)
    }, [flash])

    if (toasts.length === 0) return null

    const icons = {
        success: <CheckCircle size={16} className="shrink-0" />,
        error:   <AlertCircle size={16} className="shrink-0" />,
        warning: <Info size={16} className="shrink-0" />,
    }

    const styles = {
        success: { background: 'var(--brand-50)',  border: '1px solid var(--brand-100)',  color: 'var(--brand-700)' },
        error:   { background: 'var(--rose-100)',  border: '1px solid var(--rose-100)',   color: 'var(--rose-600)'  },
        warning: { background: 'var(--amber-100)', border: '1px solid var(--amber-100)',  color: 'var(--amber-600)' },
    }

    return (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 280, maxWidth: 380 }}>
            {toasts.map((t) => (
                <div
                    key={t.id}
                    style={{
                        ...styles[t.type],
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 13,
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    {icons[t.type]}
                    <span style={{ flex: 1 }}>{t.message}</span>
                    <button
                        onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                        style={{ marginLeft: 4, opacity: 0.7 }}
                        aria-label="Tutup"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    )
}

export default function AppLayout({ title, children }) {
    const { auth, flash } = usePage().props
    const userName = auth?.user?.name ?? 'Pengguna'
    const userRole = auth?.user?.role ?? auth?.user?.email ?? 'Compliance'
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [aiSearchOpen, setAiSearchOpen] = useState(false)

    // Global ⌘K / Ctrl+K opens the AI search modal.
    useEffect(() => {
        const onKey = (e) => {
            const isK = e.key === 'k' || e.key === 'K'
            if (isK && (e.metaKey || e.ctrlKey)) {
                // Don't intercept when the user is editing a contenteditable.
                const tag = (e.target?.tagName || '').toLowerCase()
                const editable = e.target?.isContentEditable
                if (editable && !aiSearchOpen) {
                    // Allow native shortcut inside contenteditable.
                    return
                }
                e.preventDefault()
                setAiSearchOpen((v) => !v)
            }
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [aiSearchOpen])

    return (
        <div className="app">
            {/* Top bar: brand | search | actions | user */}
            <div className="topbar">
                <div className="brand">
                    <div className="brand-mark">iD</div>
                    <div className="brand-stack">
                        <div className="brand-name">iDesk</div>
                        <div className="brand-sub">Compliance</div>
                    </div>
                </div>
                <div className="topbar-tools">
                    <div
                        className="global-search clickable"
                        onClick={() => setAiSearchOpen(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setAiSearchOpen(true)
                            }
                        }}
                    >
                        <span className="ic"><Sparkles size={16} /></span>
                        <input
                            placeholder="Tanya AI tentang kebijakan apa pun…"
                            aria-label="Pencarian AI"
                            readOnly
                            onFocus={() => setAiSearchOpen(true)}
                            style={{ cursor: 'text' }}
                        />
                        <kbd>⌘K</kbd>
                    </div>
                    <div className="top-actions">
                        <button className="icon-btn" title="Riwayat" type="button">
                            <History size={18} />
                        </button>
                        <button className="icon-btn" title="Notifikasi" type="button">
                            <Bell size={18} />
                            <span className="dot"></span>
                        </button>
                        <Link href="/pengaturan" className="icon-btn" title="Pengaturan">
                            <Settings size={18} />
                        </Link>

                        <div style={{ position: 'relative' }}>
                            <button
                                className="user-chip"
                                type="button"
                                onClick={() => setUserMenuOpen((v) => !v)}
                            >
                                <div className="avatar">{initials(userName)}</div>
                                <div className="meta">
                                    <div className="name">{userName}</div>
                                    <div className="role">{userRole}</div>
                                </div>
                                <ChevronDown size={14} />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        onClick={() => setUserMenuOpen(false)}
                                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 6px)',
                                            right: 0,
                                            zIndex: 41,
                                            minWidth: 200,
                                            background: 'var(--paper)',
                                            border: '1px solid var(--ink-200)',
                                            borderRadius: 'var(--radius-lg)',
                                            boxShadow: 'var(--shadow-lg)',
                                            padding: 6,
                                        }}
                                    >
                                        <div style={{
                                            padding: '8px 10px',
                                            borderBottom: '1px solid var(--ink-100)',
                                            marginBottom: 4,
                                        }}>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{userName}</div>
                                            <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>
                                                {auth?.user?.email}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserMenuOpen(false)
                                                router.post(route('logout'))
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '8px 10px',
                                                borderRadius: 6,
                                                fontSize: 13,
                                                color: 'var(--rose-600)',
                                                fontWeight: 500,
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--rose-100)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <LogOut size={14} /> Keluar
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="sidebar">
                {NAV_SECTIONS.map((it, i) => {
                    if (it.type === 'sec') {
                        return <div key={`sec-${i}`} className="nav-section">{it.label}</div>
                    }
                    const Icon = it.icon
                    const active = isActive(it.routeName, it.href)
                    return (
                        <Link
                            key={it.id}
                            href={it.href}
                            className={`nav-item ${active ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{it.label}</span>
                        </Link>
                    )
                })}
                <div className="side-foot">
                    <span className="env-pill">Production · v2.0</span>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                        Compliance Workspace · Pegadaian
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="main">
                {children}
            </main>

            <Toast flash={flash} />

            <AISearchModal
                open={aiSearchOpen}
                onClose={() => setAiSearchOpen(false)}
            />
        </div>
    )
}
