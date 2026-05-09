import ChipFilter from './ChipFilter'

/**
 * Inbox — split-pane inbox layout (list + detail).
 *
 * Reuses `.inbox`, `.inbox-list`, `.inbox-detail`, `.inbox-item` from app.css.
 *
 * Props:
 *   items        — array of inbox item objects
 *   selectedId   — id of currently selected item
 *   onSelect     — (id, item) callback
 *   getItemId    — (item) => id (default: item.id ?? index)
 *   renderItem   — (item, isActive) => ReactNode (defaults to <InboxItem>)
 *   renderDetail — (item) => ReactNode (rendered in right pane)
 *   chips        — array of chip filter objects (for top of list)
 *   activeChip   — selected chip value
 *   onChipSelect — chip filter callback
 *   emptyDetail  — ReactNode shown when no item selected
 *   className, style — passthrough
 */
export default function Inbox({
    items = [],
    selectedId,
    onSelect,
    getItemId = (item, idx) => item.id ?? idx,
    renderItem,
    renderDetail,
    chips,
    activeChip,
    onChipSelect,
    emptyDetail,
    className = '',
    style,
}) {
    const selected = items.find((it, i) => getItemId(it, i) === selectedId)

    return (
        <div className={`inbox ${className}`} style={style}>
            <div className="inbox-list">
                {chips && chips.length > 0 && (
                    <div
                        style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--ink-200)',
                            background: 'var(--ink-50)',
                        }}
                    >
                        <ChipFilter
                            chips={chips}
                            activeValue={activeChip}
                            onSelect={onChipSelect}
                        />
                    </div>
                )}
                {items.map((it, i) => {
                    const id = getItemId(it, i)
                    const isActive = id === selectedId
                    return (
                        <div
                            key={id}
                            className={`inbox-item ${isActive ? 'active' : ''}`}
                            onClick={
                                onSelect ? () => onSelect(id, it) : undefined
                            }
                        >
                            {renderItem ? renderItem(it, isActive) : null}
                        </div>
                    )
                })}
            </div>
            <div className="inbox-detail">
                {selected
                    ? renderDetail?.(selected)
                    : emptyDetail ?? (
                          <div
                              style={{
                                  display: 'grid',
                                  placeItems: 'center',
                                  height: '100%',
                                  color: 'var(--ink-500)',
                                  fontSize: 13,
                              }}
                          >
                              Pilih item untuk melihat detail.
                          </div>
                      )}
            </div>
        </div>
    )
}
