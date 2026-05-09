/**
 * Avatar — initials disc.
 *
 * Props:
 *   name     — full name; first+last initial used
 *   initials — explicit override
 *   size     — px diameter (default 32)
 *   bg       — background color (default var(--brand-500))
 *   fg       — foreground/text color (default white)
 *   tone     — semantic tone shorthand: 'brand'|'gold'|'info'|'rose'|'ink'
 *   tooltip  — title attribute
 *   src      — optional image url; replaces initials
 *   className, style — passthrough
 */

const TONES = {
    brand: { bg: 'var(--brand-500)', fg: '#fff' },
    gold:  { bg: 'var(--gold-500)',  fg: 'oklch(0.22 0.05 75)' },
    info:  { bg: 'var(--info-600)',  fg: '#fff' },
    rose:  { bg: 'var(--rose-600)',  fg: '#fff' },
    ink:   { bg: 'var(--ink-200)',   fg: 'var(--ink-700)' },
    amber: { bg: 'var(--amber-600)', fg: '#fff' },
}

function deriveInitials(name) {
    if (!name) return '?'
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({
    name,
    initials,
    size = 32,
    bg,
    fg,
    tone,
    tooltip,
    src,
    className = '',
    style,
}) {
    const t = tone ? TONES[tone] ?? TONES.brand : TONES.brand
    const finalBg = bg ?? t.bg
    const finalFg = fg ?? t.fg
    const text = initials ?? deriveInitials(name)
    const fontSize = Math.max(10, Math.round(size * 0.38))

    return (
        <span
            className={`avatar ${className}`}
            title={tooltip ?? name}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                display: 'inline-grid',
                placeItems: 'center',
                background: src ? 'transparent' : finalBg,
                color: finalFg,
                fontWeight: 600,
                fontSize,
                lineHeight: 1,
                flex: 'none',
                overflow: 'hidden',
                userSelect: 'none',
                ...style,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt={name ?? text}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            ) : (
                text
            )}
        </span>
    )
}
