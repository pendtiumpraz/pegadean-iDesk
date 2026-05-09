import { useState, useEffect, useRef } from 'react'
import { Sparkles, ChevronRight, FileText, Search, Clock, X } from 'lucide-react'

/**
 * AISearchModal — global ⌘K search command palette.
 *
 * Centered overlay, IBM Plex Serif input, suggestion chips, recent queries,
 * and quick-access policy tiles.
 *
 * Props:
 *   open           — boolean (required)
 *   onClose        — callback on backdrop click / Escape
 *   onSearch       — async (query) => result | void
 *                    Optional. If omitted, suggestions still work.
 *   onSelectResult — (result) callback when user clicks a result item
 *   suggestions    — array of strings ("Coba pertanyaan ini")
 *   recentQueries  — array of strings ("Riwayat pencarian")
 *   quickAccess    — array of { code, title, onClick? } for the quick-access grid
 *   placeholder    — input placeholder (default "Tanya tentang kebijakan apa pun…")
 *
 * Keyboard:
 *   Esc        — close
 *   Enter      — submit query
 */

const DEFAULT_SUGGESTIONS = [
    'Bagaimana cara penanganan nasabah PEP?',
    'Apa kebijakan terkait pelaporan gratifikasi?',
    'Aturan persetujuan limit kredit cabang',
    'Frekuensi RCS yang diwajibkan',
    'Klausul wajib kontrak vendor TI',
]

export default function AISearchModal({
    open,
    onClose,
    onSearch,
    onSelectResult,
    suggestions = DEFAULT_SUGGESTIONS,
    recentQueries = [],
    quickAccess = [],
    placeholder = 'Tanya tentang kebijakan apa pun…',
}) {
    const [query, setQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [done, setDone] = useState(false)
    const [results, setResults] = useState([])
    const [answer, setAnswer] = useState('')
    const inputRef = useRef(null)

    // Reset state on open/close
    useEffect(() => {
        if (open) {
            setQuery('')
            setResults([])
            setAnswer('')
            setDone(false)
            setSearching(false)
            // Focus input after mount
            const t = setTimeout(() => inputRef.current?.focus(), 30)
            return () => clearTimeout(t)
        }
    }, [open])

    // Esc to close
    useEffect(() => {
        if (!open) return
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    const submit = async (q) => {
        const text = (q ?? query).trim()
        if (!text) return
        setSearching(true)
        setDone(false)
        setAnswer('')
        setResults([])

        try {
            const out = onSearch ? await onSearch(text) : null
            if (out && typeof out === 'object') {
                if (out.answer) setAnswer(out.answer)
                if (Array.isArray(out.results)) setResults(out.results)
            }
        } catch (e) {
            // Silent — page can render its own error state via onSearch.
        }
        setSearching(false)
        setDone(true)
    }

    const handleKey = (e) => {
        if (e.key === 'Enter') submit()
        if (e.key === 'Escape') onClose?.()
    }

    const renderRich = (txt) => {
        if (!txt) return null
        const parts = String(txt).split(/(\*\*[^*]+\*\*)/g)
        return parts.map((p, i) =>
            p.startsWith('**') ? (
                <b key={i} style={{ color: 'var(--brand-700)' }}>
                    {p.slice(2, -2)}
                </b>
            ) : (
                <span key={i}>{p}</span>
            )
        )
    }

    return (
        <div
            className="ai-search-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(20,30,20,0.55)',
                backdropFilter: 'blur(6px)',
                zIndex: 200,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingTop: 80,
                paddingLeft: 16,
                paddingRight: 16,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--paper)',
                    borderRadius: 16,
                    width: '100%',
                    maxWidth: 760,
                    maxHeight: '80vh',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--ink-200)',
                }}
            >
                {/* Search bar */}
                <div
                    style={{
                        padding: '18px 20px',
                        borderBottom:
                            done || searching
                                ? '1px solid var(--ink-200)'
                                : 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background:
                                'linear-gradient(135deg, var(--brand-600), var(--brand-700))',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                            flex: 'none',
                        }}
                    >
                        <Sparkles size={18} />
                    </div>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder={placeholder}
                        style={{
                            flex: 1,
                            border: 0,
                            outline: 0,
                            fontSize: 17,
                            fontFamily: "'IBM Plex Serif', Georgia, serif",
                            color: 'var(--ink-900)',
                            background: 'transparent',
                            minWidth: 0,
                        }}
                    />
                    <span className="kbd">esc</span>
                    <button
                        type="button"
                        className="btn primary"
                        onClick={() => submit()}
                        disabled={searching || !query.trim()}
                    >
                        {searching ? (
                            <>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 12,
                                        height: 12,
                                        border: '2px solid white',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation:
                                            'ai-search-spin 0.8s linear infinite',
                                    }}
                                />{' '}
                                Mencari…
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} /> Tanya AI
                            </>
                        )}
                    </button>
                </div>

                {/* Empty state — suggestions + recent + quick access */}
                {!searching && !done && (
                    <div style={{ padding: 20, overflowY: 'auto' }}>
                        {suggestions && suggestions.length > 0 && (
                            <>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        letterSpacing: '.08em',
                                        textTransform: 'uppercase',
                                        color: 'var(--ink-500)',
                                        marginBottom: 10,
                                    }}
                                >
                                    Coba pertanyaan ini
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4,
                                        marginBottom: 20,
                                    }}
                                >
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setQuery(s)
                                                submit(s)
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                padding: '10px 12px',
                                                borderRadius: 8,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                background: 'transparent',
                                                border: 0,
                                                color: 'var(--ink-900)',
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    'var(--ink-50)')
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    'transparent')
                                            }
                                        >
                                            <Sparkles size={14} />
                                            <span style={{ flex: 1, fontSize: 13.5 }}>
                                                {s}
                                            </span>
                                            <ChevronRight size={14} />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {recentQueries && recentQueries.length > 0 && (
                            <>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        letterSpacing: '.08em',
                                        textTransform: 'uppercase',
                                        color: 'var(--ink-500)',
                                        marginBottom: 10,
                                    }}
                                >
                                    Pencarian terakhir
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        marginBottom: 20,
                                    }}
                                >
                                    {recentQueries.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setQuery(s)
                                                submit(s)
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '8px 12px',
                                                borderRadius: 6,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                background: 'transparent',
                                                border: 0,
                                                color: 'var(--ink-700)',
                                                fontSize: 13,
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background =
                                                    'var(--ink-50)')
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background =
                                                    'transparent')
                                            }
                                        >
                                            <Clock size={13} />
                                            <span style={{ flex: 1 }}>{s}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {quickAccess && quickAccess.length > 0 && (
                            <>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        letterSpacing: '.08em',
                                        textTransform: 'uppercase',
                                        color: 'var(--ink-500)',
                                        marginBottom: 10,
                                    }}
                                >
                                    Akses cepat
                                </div>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 8,
                                    }}
                                >
                                    {quickAccess.map((p, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={p.onClick}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '10px 12px',
                                                borderRadius: 8,
                                                border:
                                                    '1px solid var(--ink-200)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                background: 'var(--paper)',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 6,
                                                    background:
                                                        'var(--brand-50)',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    color: 'var(--brand-700)',
                                                    flex: 'none',
                                                }}
                                            >
                                                <FileText size={14} />
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {p.code && (
                                                    <div
                                                        style={{
                                                            fontFamily:
                                                                'JetBrains Mono, monospace',
                                                            fontSize: 10.5,
                                                            color: 'var(--ink-500)',
                                                        }}
                                                    >
                                                        {p.code}
                                                    </div>
                                                )}
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 12.5,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {p.title}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {(!suggestions || suggestions.length === 0) &&
                            (!recentQueries || recentQueries.length === 0) &&
                            (!quickAccess || quickAccess.length === 0) && (
                                <div
                                    style={{
                                        padding: '32px 16px',
                                        textAlign: 'center',
                                        color: 'var(--ink-500)',
                                        fontSize: 13,
                                    }}
                                >
                                    <Search
                                        size={28}
                                        style={{
                                            opacity: 0.4,
                                            marginBottom: 8,
                                        }}
                                    />
                                    <div>
                                        Mulai mengetik untuk bertanya kepada AI Co-pilot.
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Result state */}
                {(searching || done) && (
                    <div
                        style={{
                            padding: 20,
                            overflowY: 'auto',
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                background: 'var(--brand-50)',
                                border: '1px solid var(--brand-100)',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 18,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 10,
                                    fontSize: 11.5,
                                    color: 'var(--brand-700)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '.06em',
                                }}
                            >
                                <Sparkles size={13} /> Jawaban AI Co-pilot
                                {searching && (
                                    <span
                                        style={{
                                            color: 'var(--ink-500)',
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            letterSpacing: 0,
                                        }}
                                    >
                                        · menelusuri repository…
                                    </span>
                                )}
                            </div>
                            <div
                                style={{
                                    fontSize: 13.5,
                                    lineHeight: 1.65,
                                    color: 'var(--ink-900)',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {answer ? renderRich(answer) : null}
                                {searching && !answer && (
                                    <span style={{ color: 'var(--ink-500)' }}>
                                        Memuat…
                                    </span>
                                )}
                            </div>
                        </div>

                        {done && results.length > 0 && (
                            <>
                                <div
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 600,
                                        letterSpacing: '.08em',
                                        textTransform: 'uppercase',
                                        color: 'var(--ink-500)',
                                        marginBottom: 10,
                                    }}
                                >
                                    Hasil · {results.length}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 10,
                                    }}
                                >
                                    {results.map((r, i) => (
                                        <button
                                            key={r.code ?? r.id ?? i}
                                            type="button"
                                            onClick={() => onSelectResult?.(r)}
                                            style={{
                                                display: 'flex',
                                                gap: 12,
                                                padding: 12,
                                                border: '1px solid var(--ink-200)',
                                                borderRadius: 10,
                                                background: 'var(--paper)',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 7,
                                                    background:
                                                        'var(--brand-50)',
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    color: 'var(--brand-700)',
                                                    flex: 'none',
                                                }}
                                            >
                                                <FileText size={16} />
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {r.code && (
                                                    <span
                                                        className="doc-id"
                                                        style={{ marginRight: 6 }}
                                                    >
                                                        {r.code}
                                                    </span>
                                                )}
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        fontFamily:
                                                            "'IBM Plex Serif', Georgia, serif",
                                                    }}
                                                >
                                                    {r.title}
                                                </span>
                                                {r.summary && (
                                                    <div
                                                        style={{
                                                            fontSize: 12.5,
                                                            color: 'var(--ink-500)',
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        {r.summary}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight
                                                size={16}
                                                style={{
                                                    color: 'var(--ink-300)',
                                                    flex: 'none',
                                                    alignSelf: 'center',
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div
                    style={{
                        padding: '10px 18px',
                        borderTop: '1px solid var(--ink-200)',
                        background: 'var(--ink-50)',
                        borderRadius: '0 0 16px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 11.5,
                        color: 'var(--ink-500)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>
                            <span className="kbd">↵</span> kirim
                        </span>
                        <span>
                            <span className="kbd">esc</span> tutup
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Sparkles size={11} />
                        <span>iDesk AI · disetel pada repository internal</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes ai-search-spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
