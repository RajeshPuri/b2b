import { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";
import { SiteFooter } from "../../components/site-footer";

export const metadata: Metadata = {
  title: "Add Product — B2B Wholesale Marketplace",
  description: "Create a new product for your wholesale catalog",
};

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export default function NewProductPage() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <main className="form-page">
        <div className="container">
          <a href="/" className="auth-back">
            <BackIcon />
            Back to dashboard
          </a>

          <div className="page-head">
            <div>
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Supplier catalog
              </span>
              <h1 className="page-title">Add a new product</h1>
              <p className="page-sub">
                Publish a style to your storefront. Clear specifications and tiered pricing
                help buyers commit faster.
              </p>
            </div>
            <button type="submit" form="new-product-form" className="btn btn-primary">
              Publish product
            </button>
          </div>

          <div className="form-layout">
            <form id="new-product-form" className="form-card">
              <section className="form-section">
                <h2 className="form-section-title">
                  <span>1</span>
                  Product details
                </h2>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="productName">Product name</label>
                    <input
                      id="productName"
                      name="productName"
                      type="text"
                      required
                      className="input"
                      placeholder="Premium Cotton T-Shirt"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="sku">SKU</label>
                    <input
                      id="sku"
                      name="sku"
                      type="text"
                      required
                      className="input"
                      placeholder="SKU-00123"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" required className="select" defaultValue="">
                      <option value="" disabled>Select category</option>
                      <option value="men">Men&apos;s Clothing</option>
                      <option value="women">Women&apos;s Clothing</option>
                      <option value="kids">Kids&apos; Clothing</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="brand">Brand</label>
                    <input
                      id="brand"
                      name="brand"
                      type="text"
                      required
                      className="input"
                      placeholder="Brand name"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="fabric">Fabric material</label>
                  <input
                    id="fabric"
                    name="fabric"
                    type="text"
                    required
                    className="input"
                    placeholder="100% combed cotton · 240 GSM"
                  />
                </div>

                <div className="field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="textarea"
                    placeholder="Describe the fit, finish, and features buyers should know about."
                  />
                </div>
              </section>

              <section className="form-section">
                <h2 className="form-section-title">
                  <span>2</span>
                  Pricing &amp; minimums
                </h2>
                <p className="form-section-sub">
                  Prices are per unit. Buyers see your tier breaks exactly as entered.
                </p>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="price">Base price (USD)</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="input"
                      placeholder="25.99"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="moq">Minimum order quantity</label>
                    <input
                      id="moq"
                      name="moq"
                      type="number"
                      min="1"
                      step="1"
                      required
                      className="input"
                      placeholder="12"
                    />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <h2 className="form-section-title">
                  <span>3</span>
                  Visibility
                </h2>
                <div className="field">
                  <label htmlFor="status">Product status</label>
                  <select id="status" name="status" required className="select" defaultValue="">
                    <option value="" disabled>Select status</option>
                    <option value="active">Active — visible to buyers</option>
                    <option value="draft">Draft — only visible to you</option>
                    <option value="inactive">Inactive — hidden from catalog</option>
                  </select>
                  <p className="form-hint">
                    Drafts can be published later from your supplier dashboard.
                  </p>
                </div>
              </section>

              <div className="form-actions">
                <a href="/" className="btn btn-outline">Cancel</a>
                <button type="submit" className="btn btn-primary">Create product</button>
              </div>
            </form>

            <aside className="form-aside">
              <div className="aside-card">
                <h3>Checklist before publishing</h3>
                <ul className="aside-list">
                  <li><CheckIcon /> Clear, searchable product title</li>
                  <li><CheckIcon /> Accurate fabric and GSM details</li>
                  <li><CheckIcon /> Per-unit pricing with MOQ</li>
                  <li><CheckIcon /> Consistent size and color info</li>
                </ul>
              </div>

              <div className="aside-card aside-card--dark">
                <h3>Need a hand?</h3>
                <p>
                  Our supplier success team can help with photography, sizing charts, and
                  pricing strategy for your first listing.
                </p>
                <ul className="aside-list">
                  <li><CheckIcon /> Free onboarding call</li>
                  <li><CheckIcon /> Listing quality review</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
