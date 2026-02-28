import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageBreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function PageBreadcrumb({ items, className = '' }: PageBreadcrumbProps) {
    if (!items.length) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 font-mono text-[11px] text-muted uppercase tracking-[0.14em] ${className}`.trim()}
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const key = `${item.label}-${index}`;
                return (
                    <div key={key} className="flex items-center gap-2 min-w-0">
                        {item.href && !isLast ? (
                            <Link href={item.href} className="hover:text-primary transition-colors whitespace-nowrap">
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`truncate ${isLast ? 'text-foreground/60' : ''}`}>
                                {item.label}
                            </span>
                        )}
                        {!isLast && <span className="text-border/60">/</span>}
                    </div>
                );
            })}
        </nav>
    );
}
