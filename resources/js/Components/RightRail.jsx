/**
 * RightRail — detail page layout with main content + right rail column.
 *
 * Layout: `1fr / railWidth`. Used for policy detail, SERKEP overview, etc.
 *
 * Props:
 *   main       — left/main content (ReactNode)
 *   rail       — right column content (ReactNode, often a stack of cards)
 *   railWidth  — px or css value (default '320px')
 *   gap        — px or css value (default 16)
 *   className, style — passthrough
 */
export default function RightRail({
    main,
    rail,
    railWidth = '320px',
    gap = 16,
    className = '',
    style,
}) {
    return (
        <div
            className={`right-rail ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `1fr ${railWidth}`,
                gap,
                ...style,
            }}
        >
            <div style={{ minWidth: 0 }}>{main}</div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap,
                }}
            >
                {rail}
            </div>
        </div>
    )
}
