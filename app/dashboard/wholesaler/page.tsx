import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { authOptions } from "../../../lib/auth-options";
import { query } from "../../../lib/db";

export const metadata: Metadata = {
  title: "Wholesaler Dashboard — B2B Wholesale Marketplace",
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
  sku: string | null;
  brand: string | null;
  productstatus: string | null;
  category: string | null;
  price: string | null;
  moq: number | null;
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
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function CheckIcon({ done = false }: { done?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={done ? undefined : { opacity: 0.28 }}
    >
      <path d="m4 12.5 5 5L20 6.5" />
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

export default async function WholesalerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user as unknown as SessionUser;
  if (user.businessType === "CLIENT") {
    redirect("/dashboard/client");
  }

  const businessId = user.businessId || "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const businessName = user.businessName || "Atelier North Studio";
  const userName = user.name || "Supplier";
  const firstName = userName.split(" ")[0];

  let products: ProductRow[] = [];
  let openOrders = 0;

  try {
    const result = await query(
      `SELECT p.id, p.name, p.sku, p.brand, p.productstatus, c.name AS category,
              MIN(v."b2bSellingPrice")::text AS price,
              MIN(v."minOrderQuantity")::int AS moq
       FROM "Product" p
       LEFT JOIN "Category" c ON c.id = p."categoryId"
       LEFT JOIN "ProductVariant" v ON v."productId" = p.id
       WHERE p."businessId" = $1
       GROUP BY p.id, c.name
       ORDER BY p.createdat DESC
       LIMIT 8`,
      [businessId]
    );
    products = result.rows;
  } catch (error) {
    products = [];
  }

  try {
    const result = await query(
      `SELECT count(*)::int AS count FROM "Order"
       WHERE "sellerBusinessId" = $1
         AND status NOT IN ('COMPLETED', 'CANCELLED', 'RETURNED')`,
      [businessId]
    );
    openOrders = result.rows[0]?.count || 0;
  } catch (error) {
    openOrders = 0;
  }

  const navItems = [
    { label: "Overview", href: "/dashboard/wholesaler", active: true },
    { label: "Products", href: "/dashboard/wholesaler#products" },
    { label: "Orders", href: "/dashboard/wholesaler#orders" },
    { label: "Quotes", href: "/dashboard/wholesaler#quotes" },
    { label: "Payouts", href: "/dashboard/wholesaler#payouts" },
    { label: "Storefront settings", href: "/products/new" },
  ];

  const stats = [
    { label: "Active products", value: String(products.filter((p) => p.productstatus === "ACTIVE").length), icon: "box" },
    { label: "Open orders", value: String(openOrders), icon: "cart" },
    { label: "Pending quotes", value: "0", icon: "quote" },
    { label: "Revenue (30d)", value: "$0.00", icon: "wallet" },
  ];

  return (
    <DashboardShell
      variant="wholesaler"
      businessName={businessName}
      userName={userName}
      roleLabel="Supplier · Owner"
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
          <a href="/products/new" className="btn btn-primary">Add a product</a>
          <a href="/#featured" className="btn btn-outline">Preview storefront</a>
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
        <section className="dash-card" id="products">
          <div className="dash-card-head">
            <div>
              <h2 className="dash-card-title">Your catalog</h2>
              <p className="dash-card-sub">{products.length} styles listed for wholesale</p>
            </div>
            <a href="/products/new" className="dash-card-link">
              Manage all
              <ArrowIcon />
            </a>
          </div>

          {products.length > 0 ? (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>MOQ</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <span className="dash-product-name">{product.name}</span>
                        <span className="dash-product-sku">{product.sku || product.brand || "—"}</span>
                      </td>
                      <td>{product.category || "Uncategorized"}</td>
                      <td>{product.price ? `$${Number(product.price).toFixed(2)}` : "—"}</td>
                      <td>{product.moq ? `${product.moq} units` : "—"}</td>
                      <td>
                        <span className="pill pill--active">{product.productstatus || "ACTIVE"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dash-empty">
              <p className="dash-empty-title">No products yet</p>
              <p className="dash-empty-copy">Add your first style to start receiving wholesale orders.</p>
              <a href="/products/new" className="btn btn-primary">Add a product</a>
            </div>
          )}
        </section>

        <div className="dash-stack">
          <section className="dash-card">
            <div className="dash-card-head">
              <h2 className="dash-card-title">Storefront readiness</h2>
            </div>
            <ul className="checklist">
              <li className="checklist-item checklist-item--done"><CheckIcon done /> Business verified</li>
              <li className="checklist-item checklist-item--done"><CheckIcon done /> Wholesaler profile complete</li>
              <li className="checklist-item checklist-item--done"><CheckIcon done /> {products.length} styles live</li>
              <li className="checklist-item"><CheckIcon /> Add product photography</li>
              <li className="checklist-item"><CheckIcon /> Connect payout account</li>
            </ul>
          </section>

          <section className="dash-card dash-card--dark" id="payouts">
            <h2 className="dash-card-title">Payouts</h2>
            <p className="dash-card-sub">Available balance</p>
            <div className="dash-payout-value">$0.00</div>
            <p className="dash-card-sub">Next payout scheduled after your first completed order.</p>
            <a href="#orders" className="btn btn-light btn-block">View payout settings</a>
          </section>
        </div>
      </div>

      <section className="dash-card dash-card--spaced" id="orders">
        <div className="dash-card-head">
          <div>
            <h2 className="dash-card-title">Recent orders</h2>
            <p className="dash-card-sub">Wholesale orders placed by your buyers</p>
          </div>
          <span className="pill">0 open</span>
        </div>
        <div className="dash-empty">
          <p className="dash-empty-title">No orders yet</p>
          <p className="dash-empty-copy">
            Share your storefront with buyers to receive your first wholesale order. New orders
            will appear here with fulfillment steps and payment status.
          </p>
          <a href="/#featured" className="btn btn-outline">Share catalog</a>
        </div>
      </section>
    </DashboardShell>
  );
}
