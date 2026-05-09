/**
 * ChipFilter — chip filter row (uses `.filters` and `.chip` from app.css).
 *
 * Renders e.g. "Semua · 42 / Drafting · 8 / Review CPP · 12".
 *
 * Props:
 *   chips      — array of { label, value, count, icon }
 *   activeValue — currently-selected `value`
 *   onSelect   — (value, chip) callback
 *   trailing   — extra ReactNode rendered on the right (e.g. search box)
 *   showCount  — when true (default), renders "label · count" if count is set
 *   separator  — ReactNode separator between groups
 *   className, style — passthrough
 */
export default function ChipFilter({
    chips = [],
    activeValue,
    onSelect,
    trailing,
    showCount = true,
    separator,
    className = '',
    style,
}) {
    return (
        <div className={`filters ${className}`} style={style}>
            {chips.map((c, i) => {
                if (c.divider) {
                    return (
                        <span
                            key={`d-${i}`}
                            style={{
                                width: 1,
                                height: 18,
                                background: 'var(--ink-200)',
                                margin: '0 4px',
                            }}
                        />
                    )
                }
                const active =
                    activeValue !== undefined
                        ? activeValue === c.value
                        : !!c.active
                const Icon = c.icon
                return (
                    <button
                        key={c.value ?? c.label ?? i}
                        type="button"
                        className={`chip ${active ? 'active' : ''}`}
                        onClick={
                            onSelect ? () => onSelect(c.value, c) : undefined
                        }
                    >
                        {Icon && <Icon size={12} />}
                        {c.label}
                        {showCount && c.count !== undefined && c.count !== null && (
                            <span> · {c.count}</span>
                        )}
                    </button>
                )
            })}
            {trailing && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    {trailing}
                </div>
            )}
        </div>
    )
}
