import { Sparkles, Send, Clock } from 'lucide-react'

/**
 * AIPanel — right-side AI assistant panel with tabs.
 *
 * Reuses `.ai-panel`, `.ai-head`, `.ai-tabs`, `.ai-tab`, `.ai-body`,
 * `.ai-foot`, `.ai-input`, `.ai-suggest` from app.css.
 *
 * Props:
 *   title          — header title (default "AI Co-pilot Kepatuhan")
 *   subtitle       — small subtitle below header
 *   tabs           — array of { key, label, count } (default: Temuan/Saran/Rujukan/Tanya AI)
 *   activeTab      — controlled active tab key
 *   onTabChange    — (key) callback
 *   children       — main body content for active tab (when controlled)
 *   findings       — convenience: array of <AICard> nodes for "findings" tab
 *   suggestions    — convenience: ReactNode rendered when activeTab === "suggest"
 *   references     — convenience: ReactNode rendered when activeTab === "cite"
 *   chat           — convenience: ReactNode rendered when activeTab === "chat"
 *   analysisMeta   — text near top of body, e.g. "Analisa selesai 4 menit lalu · 24 hal · 18 detik"
 *   showInput      — render the bottom AI ask input (default true)
 *   inputPlaceholder
 *   onAsk          — (q) callback when send is pressed / Enter
 *   suggestChips   — array of strings shown above the input as quick prompts
 *   onSuggestPick  — (string) callback
 *   className, style — passthrough
 *
 * If you pass `children`, it is rendered as-is (you control the body).
 * Otherwise the convenience props above are used per active tab.
 */

const DEFAULT_TABS = [
    { key: 'findings', label: 'Temuan' },
    { key: 'suggest',  label: 'Saran' },
    { key: 'cite',     label: 'Rujukan' },
    { key: 'chat',     label: 'Tanya AI' },
]

export default function AIPanel({
    title = 'AI Co-pilot Kepatuhan',
    subtitle = 'Terhubung: BeComply · RCS · 247 kebijakan induk',
    tabs = DEFAULT_TABS,
    activeTab,
    onTabChange,
    children,
    findings,
    suggestions,
    references,
    chat,
    analysisMeta,
    showInput = true,
    inputPlaceholder = 'Tanya tentang dokumen ini…',
    onAsk,
    suggestChips,
    onSuggestPick,
    className = '',
    style,
}) {
    const handleKey = (e) => {
        if (e.key === 'Enter' && onAsk) {
            onAsk(e.currentTarget.value)
            e.currentTarget.value = ''
        }
    }

    let body = children
    if (!body) {
        if (activeTab === 'chat') body = chat
        else if (activeTab === 'suggest') body = suggestions
        else if (activeTab === 'cite') body = references
        else body = findings
    }

    return (
        <div
            className={`ai-panel-inner ${className}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                ...style,
            }}
        >
            <div className="ai-head">
                <div className="glyph">
                    <Sparkles size={16} />
                </div>
                <div>
                    <h3>{title}</h3>
                    {subtitle && <div className="sub">{subtitle}</div>}
                </div>
            </div>

            {tabs && tabs.length > 0 && (
                <div className="ai-tabs">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            className={`ai-tab ${activeTab === t.key ? 'active' : ''}`}
                            onClick={
                                onTabChange ? () => onTabChange(t.key) : undefined
                            }
                        >
                            {t.label}
                            {t.count !== undefined && t.count !== null && (
                                <span className="count">{t.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <div className="ai-body">
                {analysisMeta && (
                    <div
                        style={{
                            fontSize: 11.5,
                            color: 'var(--ink-500)',
                            marginBottom: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <Clock size={12} /> {analysisMeta}
                    </div>
                )}
                {body}
            </div>

            {showInput && (
                <div className="ai-foot">
                    <div className="ai-input">
                        <Sparkles size={14} />
                        <input
                            placeholder={inputPlaceholder}
                            onKeyDown={handleKey}
                        />
                        <button
                            type="button"
                            className="send"
                            onClick={(e) => {
                                const inp =
                                    e.currentTarget.parentElement.querySelector(
                                        'input'
                                    )
                                if (inp && onAsk) {
                                    onAsk(inp.value)
                                    inp.value = ''
                                }
                            }}
                        >
                            <Send size={13} strokeWidth={2} />
                        </button>
                    </div>
                    {suggestChips && suggestChips.length > 0 && (
                        <div className="ai-suggest">
                            {suggestChips.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="s"
                                    onClick={
                                        onSuggestPick
                                            ? () => onSuggestPick(s)
                                            : undefined
                                    }
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
