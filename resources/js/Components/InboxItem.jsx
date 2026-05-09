/**
 * InboxItem — single inbox row used inside `<Inbox renderItem={...}>`.
 *
 * Renders the `.inbox-item` body using existing styles from app.css.
 * The wrapper `.inbox-item` (with active/selected handling) is provided by
 * <Inbox>, so this only renders the inner content.
 *
 * Props:
 *   from     — sender display string (e.g. "Sekar Pratiwi · KaDiv Kepatuhan")
 *   time     — small right-aligned timestamp
 *   title    — main headline
 *   preview  — body preview (line-clamped via existing CSS)
 *   tags     — array of ReactNodes rendered as a tag row at the bottom
 *   unread   — when true, renders the green "new" dot in row1
 *   className, style — passthrough
 */
export default function InboxItem({
    from,
    time,
    title,
    preview,
    tags,
    unread = false,
    className = '',
    style,
}) {
    return (
        <div className={className} style={style}>
            <div className="row1">
                {unread && <span className="new" />}
                {from && (
                    <span style={{ fontWeight: 500, color: 'var(--ink-700)' }}>
                        {from}
                    </span>
                )}
                {time && (
                    <span style={{ marginLeft: 'auto' }}>{time}</span>
                )}
            </div>
            {title && <div className="title">{title}</div>}
            {preview && <div className="preview">{preview}</div>}
            {tags && tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {tags.map((t, i) => (
                        <span key={i}>{t}</span>
                    ))}
                </div>
            )}
        </div>
    )
}
