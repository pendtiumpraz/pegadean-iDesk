import { Sparkles } from 'lucide-react'

/**
 * AISuggestionCallout — brand-bordered AI suggestion box used inline on pages.
 *
 * Style: brand-300 border, brand-50 background, sparkle icon. Used after Inbox
 * details, before approve buttons, etc.
 *
 * Props:
 *   title    — bold heading
 *   body     — explanation text (ReactNode / string)
 *   actions  — ReactNode rendered on the right (e.g. accept buttons)
 *   compact  — tighter padding when true
 *   icon     — optional override icon component (default Sparkles)
 *   className, style — passthrough
 */
export default function AISuggestionCallout({
    title,
    body,
    actions,
    compact = false,
    icon: Icon = Sparkles,
    className = '',
    style,
}) {
    const pad = compact ? '12px 14px' : '16px 18px'
    return (
        <div
            className={`ai-callout ${className}`}
            style={{
                background: 'var(--brand-50)',
                border: '1px solid var(--brand-300, var(--brand-100))',
                borderRadius: 12,
                padding: pad,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                ...style,
            }}
        >
            <span
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--brand-100)',
                    color: 'var(--brand-700)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                }}
            >
                <Icon size={14} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                {title && (
                    <div
                        style={{
                            fontWeight: 600,
                            fontSize: 13,
                            marginBottom: body ? 6 : 0,
                            color: 'var(--ink-900)',
                        }}
                    >
                        {title}
                    </div>
                )}
                {body && (
                    <div
                        style={{
                            fontSize: 12.5,
                            color: 'var(--ink-700)',
                            lineHeight: 1.6,
                        }}
                    >
                        {body}
                    </div>
                )}
            </div>
            {actions && (
                <div
                    style={{
                        display: 'flex',
                        gap: 6,
                        alignItems: 'center',
                        flex: 'none',
                    }}
                >
                    {actions}
                </div>
            )}
        </div>
    )
}
