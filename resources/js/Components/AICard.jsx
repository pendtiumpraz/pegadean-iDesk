import { Check, MoreHorizontal, BookOpen } from 'lucide-react'

/**
 * AICard — single AI finding card rendered inside <AIPanel> "Temuan" tab.
 *
 * Reuses `.ai-card` from app.css. Severity controls color and quote border.
 *
 * Props:
 *   severity   — 'high' | 'med' | 'low' (default 'med')
 *   title      — bold finding title
 *   pasal      — short label rendered next to severity pill (e.g. "Pasal 7 ayat (2)")
 *   body       — finding explanation (ReactNode / string)
 *   quote      — optional quoted text from the document (renders with brand-bordered .quote box)
 *   pasalRef   — text after "Rujukan:" (e.g. "POJK 18/2024 Pasal 14")
 *   active     — when true, applies the active glow
 *   onClick    — clicking the card selects it
 *   onAccept   — (cb) "Terima saran" button
 *   onDiscuss  — (cb) "Diskusikan" button
 *   onIgnore   — (cb) "Abaikan" button
 *   onMore     — (cb) overflow menu button
 *   className, style — passthrough
 */

const SEVERITY_LABEL = {
    high: 'Risiko Tinggi',
    med:  'Sedang',
    low:  'Rendah',
}

export default function AICard({
    severity = 'med',
    title,
    pasal,
    body,
    quote,
    pasalRef,
    active = false,
    onClick,
    onAccept,
    onDiscuss,
    onIgnore,
    onMore,
    className = '',
    style,
}) {
    return (
        <div
            className={`ai-card ${severity} ${active ? 'active' : ''} ${className}`}
            onClick={onClick}
            style={style}
        >
            <div className="top">
                <div className="left">
                    <span className={`pill ${severity}`}>
                        {SEVERITY_LABEL[severity] ?? severity}
                    </span>
                    {pasal && (
                        <span
                            style={{
                                color: 'var(--ink-500)',
                                fontSize: 11.5,
                                fontWeight: 500,
                            }}
                        >
                            {pasal}
                        </span>
                    )}
                </div>
                {onMore && (
                    <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 24, height: 24 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onMore()
                        }}
                    >
                        <MoreHorizontal size={14} />
                    </button>
                )}
            </div>

            {title && (
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    {title}
                </div>
            )}
            {body && <div className="body">{body}</div>}

            {quote && <div className="quote">{quote}</div>}

            {pasalRef && (
                <div className="ref">
                    <BookOpen size={12} /> Rujukan: <a>{pasalRef}</a>
                </div>
            )}

            {(onAccept || onDiscuss || onIgnore) && (
                <div className="actions">
                    {onAccept && (
                        <button
                            type="button"
                            className="accept"
                            onClick={(e) => {
                                e.stopPropagation()
                                onAccept()
                            }}
                        >
                            <Check size={12} /> Terima saran
                        </button>
                    )}
                    {onDiscuss && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDiscuss()
                            }}
                        >
                            Diskusikan
                        </button>
                    )}
                    {onIgnore && (
                        <button
                            type="button"
                            className="reject"
                            onClick={(e) => {
                                e.stopPropagation()
                                onIgnore()
                            }}
                        >
                            Abaikan
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
