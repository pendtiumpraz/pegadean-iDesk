/**
 * Tag — neutral chip distinct from Badge (which renders status pills).
 *
 * Uses `.tag` from app.css. Add a tone shorthand for branded tag colors.
 *
 * Props:
 *   children — content (required)
 *   tone     — 'neutral' (default) | 'brand' | 'gold' | 'info' | 'rose' | 'amber' | 'ink'
 *   size     — 'sm' | 'md' (default 'md')
 *   className, style — passthrough
 */

const TONES = {
    neutral: { bg: 'var(--ink-100)',  fg: 'var(--ink-700)' },
    brand:   { bg: 'var(--brand-100)', fg: 'var(--brand-700)' },
    gold:    { bg: 'var(--gold-100)',  fg: 'var(--gold-600)'  },
    info:    { bg: 'var(--info-100)',  fg: 'var(--info-600)'  },
    rose:    { bg: 'var(--rose-100)',  fg: 'var(--rose-600)'  },
    amber:   { bg: 'var(--amber-100)', fg: 'var(--amber-600)' },
    ink:     { bg: 'var(--ink-100)',   fg: 'var(--ink-700)'   },
}

export default function Tag({
    children,
    tone = 'neutral',
    size = 'md',
    className = '',
    style,
}) {
    const t = TONES[tone] ?? TONES.neutral
    const sizeStyle =
        size === 'sm'
            ? { padding: '1px 6px', fontSize: 10.5 }
            : null

    const styled = tone !== 'neutral' || size === 'sm'
    return (
        <span
            className={`tag ${className}`}
            style={
                styled
                    ? { background: t.bg, color: t.fg, ...sizeStyle, ...style }
                    : style
            }
        >
            {children}
        </span>
    )
}
