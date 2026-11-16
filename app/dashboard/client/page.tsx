import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { authOptions } from "../../../lib/auth-options";
import { query } from "../../../lib/db";

export const metadata: Metadata = {
  title: "Client Dashboard — B2B Wholesale Marketplace",
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: string;
  businessType?: string | null;
  businessName?: string | null;
  businessId?: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: string | null;
  moq: number | null;
  color: string | null;
};

function StatIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "cart") {
    return (
      <svg {...common}>
        <path d="M6 6h15l-1.5 9h-12L6 6Z" />
        <path d="M6 6 5 3H2" />
        <circle cx="9" cy="19" r="1.6" />
        <circle cx="17" cy="19" r="1.6" />
      </svg>
    );
  }
  if (name === "quote") {
    return (
      <svg {...common}>
        <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" />
        <path d="M8 8h9M8 12h6" />
      </svg>
    );
  }
  if (name === "wallet") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2.5" />
        <path d="M3 10h18M16 15h2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3v18M17 8H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user as unknown as SessionUser;
  if (user.businessType === "WHOLESALER") {
    redirect("/dashboard/wholesaler");
  }

  const businessId = user.businessId || "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const businessName = user.businessName || "Urban Threads Retail";
  const userName = user.name || "Buyer";
  const firstName = userName.split(" ")[0];

  let recommended: ProductRow[] = [];
  let creditLimit = 0;
  let paymentTerms = "NET_30";
  let contactTitle = "Head of Buying";

  try {
    const result = await query(
      `SELECT p.id, p.name, p.brand, c.name AS category,
              MIN(v."b2bSellingPrice")::text AS price,
              MIN(v."minOrderQuantity")::int AS moq,
              MIN(v.color) AS color
       FROM "Product" p
       LEFT JOIN "Category" c ON c.id = p."categoryId"
       LEFT JOIN "ProductVariant" v ON v."productId" = p.id
       WHERE p.productstatus = 'ACTIVE'
       GROUP BY p.id, c.name
       ORDER BY p.createdat DESC
       LIMIT 4`
    );
    recommended = result.rows;
  } catch (error) {
    recommended = [];
  }

  try {
    const result = await query(
      'SELECT creditlimit, paymentterms, contactpersontitle FROM "ClientProfile" WHERE "businessId" = $1 LIMIT 1',
      [businessId]
    );
    if (result.rows.length > 0) {
      creditLimit = Number(result.rows[0].creditlimit) || 0;
      paymentTerms = result.rows[0].paymentterms || "NET_30";
      contactTitle = result.rows[0].contactpersontitle || contactTitle;
    }
  } catch (error) {
    creditLimit = 0;
  }

  const navItems = [
    { label: "Overview", href: "/dashboard/client", active: true },
    { label: "Browse catalog", href: "/#featured" },
    { label: "Orders", href: "/dashboard/client#orders" },
    { label: "Quotes", href: "/dashboard/client#quotes" },
    { label: "Suppliers", href: "/dashboard/client#suppliers" },
    { label: "Account settings", href: "/dashboard/client#settings" },
  ];

  const stats = [
    { label: "Open orders", value: "0", icon: "cart" },
    { label: "Quotes requested", value: "0", icon: "quote" },
    { label: "Credit available", value: `$${creditLimit.toLocaleString("en-US")}`, icon: "wallet" },
    { label: "Spend (30d)", value: "$0.00", icon: "spend" },
  ];

  return (
    <DashboardShell
      variant="client"
      businessName={businessName}
      userName={userName}
      roleLabel="Buyer · Owner"
      navItems={navItems}
    >
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome-title">Welcome back, {firstName}</h1>
          <p className="dash-welcome-sub">
            Here&apos;s what&apos;s happening at {businessName} today.
          </p>
        </div>
        <div className="dash-actions">
          <a href="/#featured" className="btn btn-primary">Browse catalog</a>
          <a href="/#featured" className="btn btn-outline">Request a quote</a>
        </div>
      </div>

      <div className="dash-stats">
        {stats.map((stat) => (
          <div className="dash-stat" key={stat.label}>
            <span className="dash-stat-icon"><StatIcon name={stat.icon} /></span>
            <div>
              <div className="dash-stat-value">{stat.value}</div>
              <div className="dash-stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="dash-card" id="orders">
          <div className="dash-card-head">
            <div>
              <h2 className="dash-card-title">Recent orders</h2>
              <p className="dash-card-sub">Track fulfillment and payment status</p>
            </div>
            <a href="/#featured" className="dash-card-link">
              Browse to order
              <ArrowIcon />
            </a>
          </div>
          <div className="dash-empty">
            <p className="dash-empty-title">No orders yet</p>
            <p className="dash-empty-copy">
              Once you place a wholesale order it will appear here with supplier updates,
              dispatch tracking, and invoice status.
            </p>
            <a href="/#featured" className="btn btn-primary">Start sourcing</a>
          </div>
        </section>

        <div className="dash-stack">
          <section className="dash-card">
            <div className="dash-card-head">
              <h2 className="dash-card-title">Buying profile</h2>
            </div>
            <dl className="profile-list">
              <div className="profile-row">
                <dt>Contact</dt>
                <dd>{userName}</dd>
              </div>
              <div className="profile-row">
                <dt>Title</dt>
                <dd>{contactTitle}</dd>
              </div>
              <div className="profile-row">
                <dt>Payment terms</dt>
                <dd>{paymentTerms.replace("_", " ")}</dd>
              </div>
              <div className="profile-row">
                <dt>Credit limit</dt>
                <dd>${creditLimit.toLocaleString("en-US")}</dd>
              </div>
              <div className="profile-row">
                <dt>Account status</dt>
                <dd><span className="pill pill--active">Verified</span></dd>
              </div>
            </dl>
          </section>

          <section className="dash-card dash-card--dark" id="quotes">
            <h2 className="dash-card-title">Need custom quantities?</h2>
            <p className="dash-card-sub">
              Request a quote and suppliers will respond with tiered pricing for your volume.
            </p>
            <a href="/#featured" className="btn btn-light btn-block">Request a quote</a>
          </section>
        </div>
      </div>

      <section className="dash-card dash-card--spaced" id="suppliers">
        <div className="dash-card-head">
          <div>
            <h2 className="dash-card-title">Recommended for you</h2>
            <p className="dash-card-sub">New-season styles from verified suppliers</p>
          </div>
          <a href="/#featured" className="dash-card-link">
            View all
            <ArrowIcon />
          </a>
        </div>

        {recommended.length > 0 ? (
          <ul className="dash-rec-list">
            {recommended.map((product) => (
              <li className="dash-rec" key={product.id}>
                <span className="dash-rec-tile">{product.name.slice(0, 1)}</span>
                <span className="dash-rec-info">
                  <span className="dash-rec-brand">{product.brand || "Verified supplier"}</span>
                  <span className="dash-rec-name">{product.name}</span>
                  <span className="dash-rec-meta">
                    {product.category || "Apparel"}
                    {product.color ? ` · ${product.color}` : ""}
                  </span>
                </span>
                <span className="dash-rec-price">
                  <b>{product.price ? `$${Number(product.price).toFixed(2)}` : "—"}</b>
                  <span>{product.moq ? `MOQ ${product.moq}` : "Quote"}</span>
                </span>
                <a href="/#featured" className="dash-rec-action">Request quote</a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="dash-empty">
            <p className="dash-empty-title">Catalog is being restocked</p>
            <p className="dash-empty-copy">New supplier styles will appear here shortly.</p>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
