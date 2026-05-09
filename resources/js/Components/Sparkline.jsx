/**
 * Sparkline — mini SVG line chart (with optional fill).
 *
 * Mirrors the `Spark` glyph used in dashboard.jsx KPI cards and tables.
 *
 * Props:
 *   data     — array of numbers (required)
 *   width    — px width of the chart (default 72)
 *   height   — px height of the chart (default 20)
 *   color    — stroke color (default var(--brand-600))
 *   fill     — when true (default), draws a translucent area under the line
 *   strokeWidth — line width (default 1.5)
 *   className, style — passthrough
 */
export default function Sparkline({
    data,
    width = 72,
    height = 20,
    color = 'var(--brand-600)',
    fill = true,
    strokeWidth = 1.5,
    className = '',
    style,
}) {
    if (!Array.isArray(data) || data.length < 2) {
        return (
            <svg
                className={`spark ${className}`}
                width={width}
                height={height}
                style={style}
                aria-hidden="true"
            />
        )
    }

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1)

    const toY = (v) => {
        // pad 1px top/bottom so the stroke isn't clipped
        const usable = height - 2
        return 1 + usable - ((v - min) / range) * usable
    }

    const points = data.map((v, i) => `${i * stepX},${toY(v)}`).join(' ')
    const areaPath = `M0,${height} L${data
        .map((v, i) => `${i * stepX},${toY(v)}`)
        .join(' L')} L${width},${height} Z`

    return (
        <svg
            className={`spark ${className}`}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            style={style}
            aria-hidden="true"
        >
            {fill && (
                <path
                    d={areaPath}
                    fill={color}
                    opacity={0.12}
                />
            )}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
