import { Link } from '@inertiajs/react'

/**
 * PageHeader — matches iDesk reference `.page-head`:
 * crumbs (slash-separated), serif h1, lede paragraph, page-actions on the right.
 *
 * Props:
 *   title       — main page title (string)
 *   description — optional subtitle / lede
 *   breadcrumbs — array of { label, href? }
 *   actions     — ReactNode rendered on the right
 */
export default function PageHeader({ title, description, breadcrumbs, actions }) {
    return (
        <div className="page-head">
            <div>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <div className="crumbs">
                        {breadcrumbs.map((c, i) => (
                            <span key={i}>
                                {c.href ? (
                                    <Link href={c.href}>{c.label}</Link>
                                ) : (
                                    c.label
                                )}
                            </span>
                        ))}
                    </div>
                )}
                {title && <h1>{title}</h1>}
                {description && <p className="lede">{description}</p>}
            </div>
            {actions && <div className="page-actions">{actions}</div>}
        </div>
    )
}
