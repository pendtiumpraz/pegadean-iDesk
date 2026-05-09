/**
 * StatCard — KPI tile matching iDesk reference (`.kpi`).
 *
 * Props:
 *   label      — small label above value
 *   value      — main numeric/text value
 *   unit       — optional small unit appended after value (e.g. "%", "draft")
 *   icon       — optional lucide icon component
 *   tone       — 'brand' (default) | 'gold' | 'info' | 'rose' | 'amber'
 *               controls icon-bg color
 *   delta      — optional string e.g. "▲ 6"
 *   deltaTone  — 'up' | 'down' | undefined
 *   deltaLabel — text after delta number
 *   children   — slot below (e.g. spark/sparkline custom content)
 */

const TONES = {
    brand: { bg: 'var(--brand-100)', fg: 'var(--brand-700)' },
    gold:  { bg: 'var(--gold-100)',  fg: 'var(--gold-600)'  },
    info:  { bg: 'var(--info-100)',  fg: 'var(--info-600)'  },
    rose:  { bg: 'var(--rose-100)',  fg: 'var(--rose-600)'  },
    amber: { bg: 'var(--amber-100)', fg: 'var(--amber-600)' },
}

export default function StatCard({
    label,
    value,
    unit,
    icon: Icon,
    tone = 'brand',
    delta,
    deltaTone,
    deltaLabel,
    children,
    className = '',
    style,
}) {
    const t = TONES[tone] ?? TONES.brand

    return (
        <div className={`kpi ${className}`} style={style}>
            <div className="label">
                {Icon && (
                    <span
                        className="ic-bg"
                        style={{ background: t.bg, color: t.fg }}
                    >
                        <Icon size={14} />
                    </span>
                )}
                <span>{label}</span>
            </div>
            <div className="value">
                {value ?? '—'}
                {unit && <span className="unit">{unit}</span>}
            </div>
            {(delta || deltaLabel) && (
                <div className="delta">
                    {delta && (
                        <span className={deltaTone === 'down' ? 'down' : 'up'}>{delta}</span>
                    )}
                    {deltaLabel && <span>{deltaLabel}</span>}
                </div>
            )}
            {children}
        </div>
    )
}
