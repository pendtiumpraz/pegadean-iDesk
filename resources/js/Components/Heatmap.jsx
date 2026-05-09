/**
 * Heatmap — 5x5 risk matrix (likelihood × impact).
 *
 * Each cell takes a score = likelihood + impact (or you can pass cells directly).
 * Color buckets follow the reference convention:
 *   1–6   → brand-100 (low)
 *   7–12  → amber-100 (medium)
 *   13–19 → rose-100  (elevated)
 *   20–25 → rose-600  (severe — solid red)
 *
 * Props:
 *   cells        — optional 5x5 (rows of 5) array of { count, score, label } | number
 *                  If not provided, an empty 5x5 grid is rendered.
 *   currentCell  — { row, col } 0-indexed, highlights with a white dot
 *   markers      — array of { row, col, label, size } extra dots
 *   onCellClick  — (row, col, cell) callback
 *   showLabels   — when true, renders Likelihood / Impact axis labels
 *   size         — overall edge length in px (default 320)
 *   className, style — passthrough
 */

function bucketColor(score) {
    if (score == null) return { bg: 'var(--ink-50)', fg: 'var(--ink-500)' }
    if (score >= 20) return { bg: 'var(--rose-600)', fg: '#fff' }
    if (score >= 13) return { bg: 'var(--rose-100)', fg: 'var(--rose-600)' }
    if (score >= 7)  return { bg: 'var(--amber-100)', fg: 'var(--amber-600)' }
    return { bg: 'var(--brand-100)', fg: 'var(--brand-700)' }
}

export default function Heatmap({
    cells,
    currentCell,
    markers = [],
    onCellClick,
    showLabels = true,
    size = 320,
    className = '',
    style,
}) {
    // Build 5x5 of cell objects
    const grid = Array.from({ length: 5 }, (_, rowIdx) =>
        Array.from({ length: 5 }, (_, colIdx) => {
            // Likelihood = 5 - rowIdx (top row = most likely)
            // Impact     = colIdx + 1
            const likelihood = 5 - rowIdx
            const impact = colIdx + 1
            const defaultScore = likelihood * impact
            let raw = null
            if (cells && cells[rowIdx] && cells[rowIdx][colIdx] !== undefined) {
                raw = cells[rowIdx][colIdx]
            }
            const cell =
                typeof raw === 'object' && raw !== null
                    ? raw
                    : raw != null
                    ? { score: raw }
                    : {}
            return {
                row: rowIdx,
                col: colIdx,
                likelihood,
                impact,
                score: cell.score ?? defaultScore,
                count: cell.count,
                label: cell.label,
            }
        })
    )

    const matrix = (
        <div
            className="risk-matrix heatmap-matrix"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(5, 1fr)',
                gap: 4,
                width: '100%',
                height: '100%',
            }}
        >
            {grid.flat().map((c) => {
                const tone = bucketColor(c.score)
                const isCurrent =
                    currentCell &&
                    currentCell.row === c.row &&
                    currentCell.col === c.col
                const cellMarkers = markers.filter(
                    (m) => m.row === c.row && m.col === c.col
                )
                return (
                    <div
                        key={`${c.row}-${c.col}`}
                        className="cell"
                        onClick={
                            onCellClick
                                ? () => onCellClick(c.row, c.col, c)
                                : undefined
                        }
                        title={
                            c.label ??
                            `Likelihood ${c.likelihood} × Impact ${c.impact} = ${c.score}`
                        }
                        style={{
                            background: tone.bg,
                            color: tone.fg,
                            borderRadius: 6,
                            display: 'grid',
                            placeItems: 'center',
                            position: 'relative',
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: onCellClick ? 'pointer' : 'default',
                            outline: isCurrent
                                ? '2px solid var(--brand-700)'
                                : '0',
                            outlineOffset: isCurrent ? '-2px' : 0,
                        }}
                    >
                        {c.count != null && <span>{c.count}</span>}
                        {isCurrent && (
                            <span
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: '#fff',
                                    boxShadow: '0 1px 4px rgba(0,0,0,.25)',
                                    position: 'absolute',
                                }}
                            />
                        )}
                        {cellMarkers.map((m, i) => (
                            <span
                                key={i}
                                title={m.label}
                                style={{
                                    width: m.size ?? 8,
                                    height: m.size ?? 8,
                                    borderRadius: '50%',
                                    background: m.color ?? '#fff',
                                    position: 'absolute',
                                    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                                }}
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    )

    if (!showLabels) {
        return (
            <div
                className={`heatmap-wrap ${className}`}
                style={{ width: size, height: size, ...style }}
            >
                {matrix}
            </div>
        )
    }

    return (
        <div
            className={`heatmap-wrap ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr',
                gridTemplateRows: '1fr 28px',
                gap: 6,
                width: '100%',
                maxWidth: size + 38,
                ...style,
            }}
        >
            <div
                style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    color: 'var(--ink-500)',
                    fontWeight: 600,
                    letterSpacing: '.04em',
                }}
            >
                Likelihood ↑
            </div>
            <div style={{ aspectRatio: '1 / 1' }}>{matrix}</div>
            <div />
            <div
                style={{
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    color: 'var(--ink-500)',
                    fontWeight: 600,
                    letterSpacing: '.04em',
                }}
            >
                Impact →
            </div>
        </div>
    )
}
