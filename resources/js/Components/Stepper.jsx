import { ChevronRight, Check } from 'lucide-react'

/**
 * Stepper — workflow steps (matches `.stepper` from app.css).
 *
 * Designed to match the SERKEP workflow:
 *   Pengajuan → Review Kadep → Review CPP → Kajian Hukum →
 *   Pengesahan → Penomoran → Penerbitan
 *
 * Each step: { label, status, sub }
 *   status: 'done' | 'current' | 'todo' (default 'todo')
 *
 * Props:
 *   steps        — array of step objects (required)
 *   orientation  — 'horizontal' (default) | 'vertical'
 *   trailing     — ReactNode rendered to the right (e.g. avatars cluster)
 *   className, style — passthrough
 */
export default function Stepper({
    steps = [],
    orientation = 'horizontal',
    trailing,
    className = '',
    style,
}) {
    if (orientation === 'vertical') {
        return (
            <div
                className={`stepper-vertical ${className}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    ...style,
                }}
            >
                {steps.map((s, i) => {
                    const cls =
                        s.status === 'done'
                            ? 'done'
                            : s.status === 'current'
                            ? 'current'
                            : ''
                    return (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                gap: 12,
                                alignItems: 'flex-start',
                                position: 'relative',
                                paddingBottom: 12,
                            }}
                        >
                            <div
                                className={`step ${cls}`}
                                style={{
                                    padding: 0,
                                    background: 'transparent',
                                    flex: 'none',
                                }}
                            >
                                <div className="dot">
                                    {s.status === 'done' ? (
                                        <Check size={12} strokeWidth={3} />
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight:
                                            s.status === 'current' ? 600 : 500,
                                        fontSize: 13,
                                        color:
                                            s.status === 'todo'
                                                ? 'var(--ink-500)'
                                                : 'var(--ink-900)',
                                    }}
                                >
                                    {s.label}
                                </div>
                                {s.sub && (
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color: 'var(--ink-500)',
                                            marginTop: 2,
                                        }}
                                    >
                                        {s.sub}
                                    </div>
                                )}
                            </div>
                            {i < steps.length - 1 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: 11,
                                        top: 24,
                                        bottom: 0,
                                        width: 2,
                                        background:
                                            s.status === 'done'
                                                ? 'var(--brand-500)'
                                                : 'var(--ink-200)',
                                    }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className={`stepper ${className}`} style={style}>
            {steps.map((s, i) => {
                const cls =
                    s.status === 'done'
                        ? 'done'
                        : s.status === 'current'
                        ? 'current'
                        : ''
                return (
                    <span
                        key={i}
                        style={{ display: 'contents' }}
                    >
                        <div className={`step ${cls}`} title={s.sub}>
                            <div className="dot">
                                {s.status === 'done' ? (
                                    <Check size={12} strokeWidth={3} />
                                ) : (
                                    i + 1
                                )}
                            </div>
                            <div className="lab">{s.label}</div>
                        </div>
                        {i < steps.length - 1 && (
                            <ChevronRight
                                size={14}
                                strokeWidth={2}
                                className="arr"
                                style={{ color: 'var(--ink-300)' }}
                            />
                        )}
                    </span>
                )
            })}
            {trailing && (
                <div
                    style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: 'var(--ink-500)',
                    }}
                >
                    {trailing}
                </div>
            )}
        </div>
    )
}
