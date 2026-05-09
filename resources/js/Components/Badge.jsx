/**
 * Badge — uses iDesk reference `.pill` (with leading dot) or `.tag` (flat) classes.
 *
 * variant:
 *   'pill' (default) — round status pill with leading dot, bound to a tone class
 *   'tag'            — flat tag/chip, neutral or custom
 *
 * status (case-insensitive) maps to a tone:
 *   draft / archived / selesai → draft (neutral ink)
 *   review / pemantauan / pending → review (info)
 *   kajian / sedang / medium → kajian (amber)
 *   approve / approved / aktif → approve (brand)
 *   released / terbit → released (brand)
 *   rejected / expired → rejected (rose)
 *   high / tinggi → high (rose)
 *   med / medium → med (amber)
 *   low / rendah → low (brand)
 *
 * Unknown status falls back to neutral `.tag`.
 */

const STATUS_TONE = {
    // workflow
    draft:       'draft',
    archived:    'draft',
    selesai:     'draft',
    review:      'review',
    pemantauan:  'review',
    pending:     'review',
    kajian:      'kajian',
    approve:     'approve',
    approved:    'approve',
    aktif:       'approve',
    termitigasi: 'approve',
    released:    'released',
    terbit:      'released',
    rejected:    'rejected',
    expired:     'rejected',
    // risk levels
    high:        'high',
    tinggi:      'high',
    med:         'med',
    medium:      'med',
    sedang:      'med',
    low:         'low',
    rendah:      'low',
}

const TONE_LABEL = {
    draft:    'Draft',
    review:   'Review',
    kajian:   'Kajian',
    approve:  'Pengesahan',
    released: 'Terbit',
    rejected: 'Ditolak',
    high:     'Tinggi',
    med:      'Sedang',
    low:      'Rendah',
}

export default function Badge({
    status,
    label,
    variant = 'pill',
    className = '',
    style,
}) {
    const key = (status ?? '').toString().toLowerCase().trim()
    const tone = STATUS_TONE[key]
    const display = label ?? (tone ? TONE_LABEL[tone] : status ?? '—')

    if (variant === 'tag' || !tone) {
        return (
            <span className={`tag ${className}`} style={style}>
                {display}
            </span>
        )
    }

    return (
        <span className={`pill ${tone} ${className}`} style={style}>
            {display}
        </span>
    )
}
