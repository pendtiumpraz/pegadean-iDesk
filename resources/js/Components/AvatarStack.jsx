/**
 * AvatarStack — overlapping cluster of small avatars with `+N` overflow.
 *
 * Reuses `.avatars` and `.a` classes from app.css.
 *
 * Props:
 *   users — array of { name?, initials?, tone?, bg?, fg?, src? }
 *   max   — how many avatars to show before collapsing (default 3)
 *   size  — px diameter (default 24)
 *   className, style — passthrough
 */

const TONE_CLASS = {
    brand: '',     // .a default = brand
    gold:  'b2',
    info:  'b3',
    rose:  'b4',
}

function deriveInitials(name) {
    if (!name) return '?'
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AvatarStack({
    users = [],
    max = 3,
    size = 24,
    className = '',
    style,
}) {
    const visible = users.slice(0, max)
    const overflow = users.length - visible.length

    const sizePx = `${size}px`
    const fontPx = Math.max(9, Math.round(size * 0.4))

    return (
        <div
            className={`avatars ${className}`}
            style={{ display: 'flex', ...style }}
        >
            {visible.map((u, i) => {
                const text = u.initials ?? deriveInitials(u.name)
                const toneCls = u.tone ? TONE_CLASS[u.tone] ?? '' : ''
                return (
                    <span
                        key={i}
                        className={`a ${toneCls}`}
                        title={u.name}
                        style={{
                            width: sizePx,
                            height: sizePx,
                            fontSize: fontPx,
                            ...(u.bg ? { background: u.bg } : null),
                            ...(u.fg ? { color: u.fg } : null),
                        }}
                    >
                        {u.src ? (
                            <img
                                src={u.src}
                                alt={u.name ?? text}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            text
                        )}
                    </span>
                )
            })}
            {overflow > 0 && (
                <span
                    className="a more"
                    style={{
                        width: sizePx,
                        height: sizePx,
                        fontSize: fontPx,
                    }}
                >
                    +{overflow}
                </span>
            )}
        </div>
    )
}
