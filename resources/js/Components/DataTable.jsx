/**
 * DataTable — wraps content in a `.card` with optional filters bar and `.table`.
 * Matches the iDesk reference SerkepList / Repo pattern.
 *
 * Props:
 *   columns:  Array<{
 *     key: string,
 *     header: string,
 *     render?: (row, index) => ReactNode,   // custom cell
 *     align?: 'left' | 'right' | 'center',
 *     style?: CSSProperties,                // extra style for td
 *     thStyle?: CSSProperties,
 *   }>
 *   data:     Array<row>
 *   getRowKey?: (row, index) => string|number
 *   filters?:  ReactNode      — content for `.filters` bar (chips, search, etc.)
 *   actions?:  ReactNode      — extra actions placed at top-right of the card head
 *   title?:    string         — when set, renders a `.card-head` instead of `.filters`
 *   subtitle?: string
 *   emptyMessage?: string
 *   onRowClick?: (row, index) => void
 *   className?: string
 */
export default function DataTable({
    columns = [],
    data = [],
    getRowKey,
    filters,
    actions,
    title,
    subtitle,
    emptyMessage = 'Belum ada data.',
    onRowClick,
    className = '',
}) {
    const hasHead = Boolean(title || subtitle || actions)
    const rows = Array.isArray(data) ? data : []

    return (
        <div className={`card ${className}`}>
            {hasHead && (
                <div className="card-head">
                    <div>
                        {title && <h3>{title}</h3>}
                        {subtitle && <div className="sub">{subtitle}</div>}
                    </div>
                    {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
                </div>
            )}

            {filters && <div className="filters">{filters}</div>}

            <div style={{ overflowX: 'auto' }}>
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    style={{
                                        textAlign: c.align ?? 'left',
                                        ...c.thStyle,
                                    }}
                                >
                                    {c.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    style={{
                                        textAlign: 'center',
                                        color: 'var(--ink-500)',
                                        padding: '40px 14px',
                                    }}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, i) => {
                                const key = getRowKey ? getRowKey(row, i) : (row.id ?? i)
                                return (
                                    <tr
                                        key={key}
                                        onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                                        style={onRowClick ? { cursor: 'pointer' } : undefined}
                                    >
                                        {columns.map((c) => (
                                            <td
                                                key={c.key}
                                                style={{
                                                    textAlign: c.align ?? 'left',
                                                    ...c.style,
                                                }}
                                            >
                                                {c.render
                                                    ? c.render(row, i)
                                                    : row[c.key] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
