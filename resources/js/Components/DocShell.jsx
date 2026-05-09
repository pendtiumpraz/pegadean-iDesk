/**
 * DocShell — 3-column document layout used by SERKEP review.
 *
 *   ┌─────────┬───────────────────────┬─────────┐
 *   │  TOC    │      doc-paper        │ ai-panel│
 *   │ 220px   │       fluid           │  320px  │
 *   └─────────┴───────────────────────┴─────────┘
 *
 * Reuses `.doc-shell`, `.doc-toc`, `.doc-canvas`, `.ai-panel` from app.css.
 *
 * Props:
 *   toc       — ReactNode for the left column (typically TOC items)
 *   paper     — ReactNode for the centre column (use <DocPaper>)
 *   aiPanel   — ReactNode for the right column (use <AIPanel>)
 *   tocWidth  — px or css value (default '220px')
 *   aiWidth   — px or css value (default '320px')
 *   className, style — passthrough
 */
export default function DocShell({
    toc,
    paper,
    aiPanel,
    tocWidth = '220px',
    aiWidth = '320px',
    className = '',
    style,
}) {
    return (
        <div
            className={`doc-shell ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `${tocWidth} 1fr ${aiWidth}`,
                gap: 16,
                ...style,
            }}
        >
            <div className="doc-toc">{toc}</div>
            <div className="doc-canvas">{paper}</div>
            <div className="ai-panel">{aiPanel}</div>
        </div>
    )
}
