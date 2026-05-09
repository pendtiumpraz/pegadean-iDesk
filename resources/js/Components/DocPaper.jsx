/**
 * DocPaper — center document content rendered in IBM Plex Serif.
 *
 * Uses `.doc-paper` from app.css. Body content is wrapped to enforce serif
 * typography via the `font-family: 'IBM Plex Serif', Georgia, serif` rule.
 *
 * Props:
 *   eyebrow — small uppercase label rendered above title (e.g. "SERKEP · SK-2026/0431 · DRAFT v3")
 *   title   — serif H2 title
 *   meta    — array of { label, value } | ReactNode for the meta row under title
 *   children — body content (paragraphs, lists, .pasal headings, etc.)
 *   className, style — passthrough
 */
export default function DocPaper({
    eyebrow,
    title,
    meta,
    children,
    className = '',
    style,
}) {
    return (
        <div
            className={`doc-paper ${className}`}
            style={{
                fontFamily: "'IBM Plex Serif', Georgia, serif",
                ...style,
            }}
        >
            {eyebrow && (
                <div
                    style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: 11,
                        color: 'var(--ink-500)',
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        fontWeight: 600,
                    }}
                >
                    {eyebrow}
                </div>
            )}
            {title && (
                <h2
                    style={{
                        marginTop: eyebrow ? 10 : 0,
                        fontFamily: "'IBM Plex Serif', Georgia, serif",
                    }}
                >
                    {title}
                </h2>
            )}
            {meta && (
                Array.isArray(meta) ? (
                    <div className="doc-meta">
                        {meta.map((m, i) => (
                            <span key={i}>
                                {m.label && (
                                    <b style={{ color: 'var(--ink-700)', fontWeight: 600 }}>
                                        {m.label}:
                                    </b>
                                )}{' '}
                                {m.value}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="doc-meta">{meta}</div>
                )
            )}
            <div className="doc-paper-body">{children}</div>
        </div>
    )
}
