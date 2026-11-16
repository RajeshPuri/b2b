import { Metadata } from "next";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";

export const metadata: Metadata = {
  title: "B2B Wholesale Marketplace — Source Premium Apparel at Scale",
  description:
    "The wholesale marketplace for modern apparel retailers. Verified suppliers, transparent pricing, and low minimum order quantities.",
};

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function TeeIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M8.5 4 5 5.8 3.4 9.4l2.9 1.4.9-1.6V20h9.6V9.2l.9 1.6 2.9-1.4-1.6-3.6L15.5 4a3.5 3.5 0 0 1-7 0Z" />
    </svg>
  );
}

function DressIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M9.2 3.5c0 1.4 1.2 2.4 2.8 2.4s2.8-1 2.8-2.4" />
      <path d="M9.2 3.5 7 8.2l2.6 1.6L8 20.5h8l-1.6-10.7L17 8.2l-2.2-4.7" />
    </svg>
  );
}

function KidsIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <path d="M9 4.5 6.2 6l-1.4 3.1 2.4 1.2.8-1.3v4M15 4.5l2.8 1.5 1.4 3.1-2.4 1.2-.8-1.3v4" />
      <path d="M9 4.5a3 3 0 0 0 6 0" />
      <path d="M9 8.5v6.2h6V8.5" />
      <path d="M10.2 18.5v2M13.8 18.5v2" />
    </svg>
  );
}

function BagIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} aria-hidden="true">
      <rect x="4" y="8" width="16" height="12" rx="2.2" />
      <path d="M8.5 8V6.4a3.5 3.5 0 0 1 7 0V8" />
      <path d="M9.5 12.5h5" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5.5c0 4.4 3 7.6 7 9.5 4-1.9 7-5.1 7-9.5V6l-7-3Z" />
      <path d="m9 11.8 2.2 2.2L15.4 9.8" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h11v10H3z" />
      <path d="M14 9h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </svg>
  );
}

const categories = [
  { name: "Men's Clothing", count: "128 wholesale styles", tone: "tone-amber", icon: <TeeIcon /> },
  { name: "Women's Clothing", count: "164 wholesale styles", tone: "tone-rose", icon: <DressIcon /> },
  { name: "Kids' Clothing", count: "86 wholesale styles", tone: "tone-olive", icon: <KidsIcon /> },
  { name: "Accessories", count: "92 wholesale styles", tone: "tone-slate", icon: <BagIcon /> },
];

const products = [
  {
    brand: "Atelier North",
    name: "Heavyweight Boxy Tee",
    meta: "100% combed cotton · 240 GSM",
    price: "$14.50 – $18.00",
    unit: "/ unit",
    moq: "MOQ 24",
    badge: "Bestseller",
    badgeClass: "product-badge--brand",
    tone: "tone-sand",
    icon: <TeeIcon size={96} />,
    swatches: ["swatch--ink", "swatch--sand", "swatch--olive"],
  },
  {
    brand: "Maison Coast",
    name: "Relaxed Linen Shirt",
    meta: "European linen · Garment washed",
    price: "$26.00 – $32.00",
    unit: "/ unit",
    moq: "MOQ 12",
    badge: "New season",
    badgeClass: "",
    tone: "tone-slate",
    icon: <TeeIcon size={96} />,
    swatches: ["swatch--sand", "swatch--ink", "swatch--rust"],
  },
  {
    brand: "Workroom",
    name: "Utility Cargo Pant",
    meta: "Cotton twill · 6-pocket build",
    price: "$22.75 – $27.50",
    unit: "/ unit",
    moq: "MOQ 36",
    badge: "Restock",
    badgeClass: "product-badge--brand",
    tone: "tone-olive",
    icon: <DressIcon size={96} />,
    swatches: ["swatch--olive", "swatch--ink", "swatch--sand"],
  },
  {
    brand: "Northline",
    name: "Cropped Puffer Jacket",
    meta: "Recycled shell · Thermal fill",
    price: "$38.00 – $46.00",
    unit: "/ unit",
    moq: "MOQ 12",
    badge: "SS26",
    badgeClass: "",
    tone: "tone-amber",
    icon: <BagIcon size={96} />,
    swatches: ["swatch--rust", "swatch--ink", "swatch--olive"],
  },
];

const stats = [
  { value: "180+", label: "Verified suppliers" },
  { value: "2,400+", label: "Active buyers" },
  { value: "12", label: "Units min. order" },
  { value: "98%", label: "On-time delivery" },
];

export default function HomePage() {
  return (
    <div>
      <SiteHeader />

      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              SS26 wholesale is live
            </span>
            <h1 className="hero-title">
              Source premium apparel
              <br />
              at <span className="accent">wholesale scale.</span>
            </h1>
            <p className="hero-lede">
              Connect directly with verified manufacturers and independent labels.
              Transparent tiered pricing, low minimums, and reorders that grow with your store.
            </p>
            <div className="hero-actions">
              <a href="#categories" className="btn btn-primary">
                Browse the catalog
                <span className="btn-arrow"><ArrowIcon /></span>
              </a>
              <a href="/products/new" className="btn btn-outline">
                Become a supplier
              </a>
            </div>
            <div className="hero-trust">
              <span><CheckIcon /> No listing fees</span>
              <span><CheckIcon /> Buyer protection</span>
              <span><CheckIcon /> Net-30 terms available</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-stage">
              <div className="stage-copy">
                <span className="stage-tag">SS26 · Lookbook</span>
                <div className="stage-title">
                  Heavyweight
                  <br />
                  essentials
                </div>
                <div className="stage-meta">
                  <span>18 styles</span>
                  <span>240 GSM</span>
                  <span>From $14.50</span>
                </div>
              </div>

              <div className="stage-graphic">
                <TeeIcon size={250} />
              </div>
            </div>

            <div className="float-card float-moq">
              <span className="float-moq-icon"><TagIcon /></span>
              <span>
                <b>MOQ from 12 units</b>
                <span>Mix sizes &amp; colors</span>
              </span>
            </div>

            <div className="float-card float-order">
              <div className="float-order-head">
                <span>Draft order</span>
                <span className="float-order-badge">Verified</span>
              </div>
              <div className="float-order-row">
                <span>Boxy Tee · 24</span>
                <b>$348.00</b>
              </div>
              <div className="float-order-row">
                <span>Linen Shirt · 12</span>
                <b>$316.80</b>
              </div>
              <div className="float-order-total">
                <span>Total</span>
                <b>$664.80</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="section" id="categories">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Shop by category</h2>
              <p className="section-sub">
                Curated wholesale collections from suppliers audited for quality and reliability.
              </p>
            </div>
            <a href="#featured" className="section-link">
              View all collections
              <ArrowIcon />
            </a>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <a href="#featured" className="category-card" key={category.name}>
                <div className={`category-visual ${category.tone}`}>{category.icon}</div>
                <div className="category-body">
                  <div>
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">{category.count}</span>
                  </div>
                  <span className="category-arrow"><ArrowIcon /></span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft" id="featured">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Featured wholesale picks</h2>
              <p className="section-sub">
                Best-selling staples and new-season pieces with transparent per-unit pricing.
              </p>
            </div>
            <a href="#categories" className="section-link">
              Browse full catalog
              <ArrowIcon />
            </a>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.name}>
                <div className={`product-media ${product.tone}`}>
                  {product.badge ? (
                    <span className={`product-badge ${product.badgeClass}`}>{product.badge}</span>
                  ) : null}
                  {product.icon}
                </div>
                <div className="product-body">
                  <span className="product-brand">{product.brand}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-meta">{product.meta}</p>
                  <div className="product-footer">
                    <div>
                      <div className="product-price">
                        {product.price}
                        <span> {product.unit}</span>
                      </div>
                      <p className="product-meta">{product.moq}</p>
                    </div>
                    <div className="swatches">
                      {product.swatches.map((swatch, index) => (
                        <span className={`swatch ${swatch}`} key={index} />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="benefits">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Built for serious retailers</h2>
              <p className="section-sub">
                Everything you need to stock confidently — without the usual wholesale friction.
              </p>
            </div>
          </div>

          <div className="benefits">
            <div className="benefit">
              <span className="benefit-icon"><ShieldIcon /></span>
              <h3 className="benefit-title">Verified suppliers only</h3>
              <p className="benefit-copy">
                Every supplier passes factory and quality checks before listing. Ratings and
                fulfillment history are visible on each product.
              </p>
            </div>
            <div className="benefit">
              <span className="benefit-icon"><TagIcon /></span>
              <h3 className="benefit-title">Transparent tiered pricing</h3>
              <p className="benefit-copy">
                See exact per-unit costs at every quantity tier. No hidden fees, no
                quote-by-email delays — price breaks are visible upfront.
              </p>
            </div>
            <div className="benefit">
              <span className="benefit-icon"><TruckIcon /></span>
              <h3 className="benefit-title">Low MOQs, reliable reorders</h3>
              <p className="benefit-copy">
                Start with as few as 12 units, mix sizes and colors, and reorder winning
                styles in a couple of clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div className="cta-inner">
              <div>
                <h2 className="cta-title">Ready to stock your next bestseller?</h2>
                <p className="cta-copy">
                  Join 2,400+ independent retailers buying directly from verified apparel suppliers.
                  Create a free buyer account in under two minutes.
                </p>
              </div>
              <div className="cta-actions">
                <a href="/auth/register" className="btn btn-primary">
                  Create buyer account
                  <span className="btn-arrow"><ArrowIcon /></span>
                </a>
                <a href="/auth/login" className="btn btn-light">Sign in</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
