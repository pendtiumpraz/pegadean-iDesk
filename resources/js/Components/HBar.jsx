/**
 * HBar — horizontal mini bar (used in alert score, category breakdowns).
 *
 * Props:
 *   value      — current value (number)
 *   max        — denominator (default 100)
 *   color      — bar fill (default var(--brand-500))
 *   trackColor — track behind the bar (default var(--ink-100))
 *   height     — px height (default 6)
 *   label      — optional label rendered above the bar
 *   valueLabel — optional value label rendered to the right
 *   showValue  — render numeric value on the right (default false unless valueLabel set)
 *   width      — explicit width (default '100%')
 *   className, style — passthrough
 */
export default function HBar({
    value = 0,
    max = 100,
    color = 'var(--brand-500)',
    trackColor = 'var(--ink-100)',
    height = 6,
    label,
    valueLabel,
    showValue = false,
    width = '100%',
    className = '',
    style,
}) {
    const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100))
    const showRightSide = valueLabel !== undefined || showValue

    const bar = (
        <div
            style={{
                flex: 1,
                height,
                background: trackColor,
                borderRadius: height / 2,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: height / 2,
                    transition: 'width .25s ease',
                }}
            />
        </div>
    )

    return (
        <div className={className} style={{ width, ...style }}>
            {label && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        marginBottom: 4,
                    }}
                >
                    <span style={{ fontWeight: 500 }}>{label}</span>
                    {showRightSide && (
                        <span style={{ color: 'var(--ink-500)' }}>
                            {valueLabel ?? value}
                        </span>
                    )}
                </div>
            )}
            {!label && showRightSide ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {bar}
                    <span
                        style={{
                            fontWeight: 600,
                            fontSize: 12,
                            minWidth: 28,
                            textAlign: 'right',
                        }}
                    >
                        {valueLabel ?? value}
                    </span>
                </div>
            ) : (
                bar
            )}
        </div>
    )
}
