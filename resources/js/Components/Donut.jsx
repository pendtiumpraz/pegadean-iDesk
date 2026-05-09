/**
 * Donut — SVG ring chart.
 *
 * Two modes:
 *   1) Single value mode — pass `value` (0..100) for a single-arc gauge.
 *   2) Segments mode    — pass `segments` array of { value, color, label }.
 *
 * Props:
 *   value         — single percent value (0..100)
 *   segments      — array of { value, color, label }
 *   size          — px diameter (default 120)
 *   thickness     — ring thickness in px (default 12)
 *   color         — single-mode arc color (default var(--brand-600))
 *   trackColor    — empty/track color (default var(--ink-100))
 *   centerLabel   — small text above center value
 *   centerValue   — main center text/number
 *   centerSub     — small text below
 *   className, style — passthrough
 */
export default function Donut({
    value,
    segments,
    size = 120,
    thickness = 12,
    color = 'var(--brand-600)',
    trackColor = 'var(--ink-100)',
    centerLabel,
    centerValue,
    centerSub,
    className = '',
    style,
}) {
    const r = (size - thickness) / 2
    const cx = size / 2
    const cy = size / 2
    const circ = 2 * Math.PI * r

    let arcs
    if (Array.isArray(segments) && segments.length > 0) {
        const total = segments.reduce((a, s) => a + (s.value || 0), 0) || 1
        let acc = 0
        arcs = segments.map((s, i) => {
            const len = (s.value / total) * circ
            const node = (
                <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={s.color || 'var(--brand-600)'}
                    strokeWidth={thickness}
                    strokeDasharray={`${len} ${circ - len}`}
                    strokeDashoffset={-acc}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    strokeLinecap="butt"
                />
            )
            acc += len
            return node
        })
    } else {
        const pct = Math.max(0, Math.min(100, Number(value) || 0))
        const len = (pct / 100) * circ
        arcs = (
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                transform={`rotate(-90 ${cx} ${cy})`}
                strokeLinecap="round"
            />
        )
    }

    return (
        <div
            className={`donut-wrap ${className}`}
            style={{
                position: 'relative',
                width: size,
                height: size,
                flex: 'none',
                ...style,
            }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={thickness}
                />
                {arcs}
            </svg>
            {(centerValue || centerLabel || centerSub) && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <div>
                        {centerLabel && (
                            <div
                                style={{
                                    fontSize: 11,
                                    color: 'var(--ink-500)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '.06em',
                                }}
                            >
                                {centerLabel}
                            </div>
                        )}
                        {centerValue !== undefined && centerValue !== null && (
                            <div
                                style={{
                                    fontFamily: "'IBM Plex Serif', Georgia, serif",
                                    fontSize: Math.round(size * 0.22),
                                    fontWeight: 600,
                                    color: 'var(--ink-900)',
                                    lineHeight: 1.1,
                                }}
                            >
                                {centerValue}
                            </div>
                        )}
                        {centerSub && (
                            <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                                {centerSub}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
