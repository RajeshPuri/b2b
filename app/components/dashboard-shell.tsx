import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

type DashboardShellProps = {
  variant: "wholesaler" | "client";
  businessName: string;
  userName: string;
  roleLabel: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

function DashboardIcon({ name }: { name: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "products") {
    return (
      <svg {...common}>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg {...common}>
        <path d="M6 6h15l-1.5 9h-12L6 6Z" />
        <path d="M6 6 5 3H2" />
        <circle cx="9" cy="19" r="1.6" />
        <circle cx="17" cy="19" r="1.6" />
      </svg>
    );
  }

  if (name === "quotes") {
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
        <path d="M8 8h9M8 12h6" />
      </svg>
    );
  }

  if (name === "payouts") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M16 15h2" />
      </svg>
    );
  }

  if (name === "catalog") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </svg>
    );
  }

  if (name === "suppliers") {
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3.4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .33 1.8l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.6 1.6 0 0 0-1.8-.33 1.6 1.6 0 0 0-1 1.46V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-1-1.46 1.6 1.6 0 0 0-1.8.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.46-1H3a2 2 0 1 1 0-4h.09a1.6 1.6 0 0 0 1.46-1 1.6 1.6 0 0 0-.33-1.8l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.6 1.6 0 0 0 8.85 4.6 1.6 1.6 0 0 0 10.3 3.14V3a2 2 0 1 1 4 0v.09a1.6 1.6 0 0 0 1 1.46 1.6 1.6 0 0 0 1.8-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.6 1.6 0 0 0-.33 1.8 1.6 1.6 0 0 0 1.46 1H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.46 1Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="3" width="7.5" height="9.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.5" />
      <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5" />
    </svg>
  );
}

export function DashboardShell({
  variant,
  businessName,
  userName,
  roleLabel,
  navItems,
  children,
}: DashboardShellProps) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <Link href="/" className="brand" aria-label="B2B Wholesale Marketplace home">
          <span className="brand-mark">B2B</span>
          <span>
            <span className="brand-name">B2B WHOLESALE</span>
            <span className="brand-sub">{variant === "wholesaler" ? "Supplier hub" : "Buyer hub"}</span>
          </span>
        </Link>

        <nav className="dash-nav" aria-label="Dashboard">
          <span className="dash-nav-label">Workspace</span>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`dash-nav-link${item.active ? " dash-nav-link--active" : ""}`}
            >
              <DashboardIcon name={item.href.includes("catalog") ? "catalog" : item.href.includes("orders") ? "orders" : item.href.includes("quotes") ? "quotes" : item.href.includes("payout") ? "payouts" : item.href.includes("supplier") ? "suppliers" : item.href.includes("setting") ? "settings" : "products"} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="dash-sidebar-foot">
          <div className="dash-user">
            <span className="dash-user-avatar">{initials || "B2B"}</span>
            <span className="dash-user-meta">
              <span className="dash-user-name">{userName}</span>
              <span className="dash-user-role">{roleLabel}</span>
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <div>
            <span className="dash-badge">{variant === "wholesaler" ? "Wholesaler" : "Client"} dashboard</span>
            <span className="dash-topbar-sub">{businessName}</span>
          </div>
          <div className="dash-topbar-actions">
            <Link href="/" className="btn btn-outline dash-topbar-btn">View storefront</Link>
            {variant === "wholesaler" ? (
              <Link href="/products/new" className="btn btn-primary dash-topbar-btn">Add product</Link>
            ) : (
              <Link href="/#featured" className="btn btn-primary dash-topbar-btn">Browse catalog</Link>
            )}
          </div>
        </header>

        <div className="dash-body">{children}</div>
      </div>
    </div>
  );
}
