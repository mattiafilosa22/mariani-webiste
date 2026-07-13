import Link from "next/link";

export type Crumb = { label: string; href?: string };

type BreadcrumbProps = {
  items: Crumb[];
  ariaLabel: string;
};

const chevron = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/**
 * Breadcrumb accessibile (RSC). L'ultima voce è la pagina corrente
 * (`aria-current`); le precedenti sono link.
 */
export function Breadcrumb({ items, ariaLabel }: BreadcrumbProps) {
  return (
    <nav className="breadcrumb" aria-label={ariaLabel}>
      <div className="container">
        <ol>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`}>
                {item.href && !isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
                {!isLast ? <span aria-hidden="true">{chevron}</span> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
