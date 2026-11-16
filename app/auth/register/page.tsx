import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — B2B Wholesale Marketplace",
  description: "Create a free buyer account for the B2B wholesale clothing marketplace",
};

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5.5c0 4.4 3 7.6 7 9.5 4-1.9 7-5.1 7-9.5V6l-7-3Z" />
      <path d="m9 11.8 2.2 2.2L15.4 9.8" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m20.6 13.4-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h11v10H3z" />
      <path d="M14 9h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <aside className="auth-aside">
          <div className="auth-aside-content">
            <div className="brand">
              <span className="brand-mark">B2B</span>
              <span>
                <span className="brand-name">B2B WHOLESALE</span>
                <span className="brand-sub">Marketplace</span>
              </span>
            </div>

            <h1 className="auth-aside-title">
              Start sourcing in
              <br />
              <span className="accent">under two minutes.</span>
            </h1>
            <p className="auth-aside-copy">
              Create a buyer account to unlock wholesale pricing, request quotes, and place
              your first low-minimum order.
            </p>

            <div className="auth-points">
              <div className="auth-point">
                <span className="auth-point-icon"><ShieldIcon /></span>
                Free account, no listing or membership fees
              </div>
              <div className="auth-point">
                <span className="auth-point-icon"><TagIcon /></span>
                Wholesale prices from verified suppliers
              </div>
              <div className="auth-point">
                <span className="auth-point-icon"><TruckIcon /></span>
                Order from 12 units, mix sizes and colors
              </div>
            </div>
          </div>

          <div className="auth-aside-foot">
            Supplier? You can register a storefront from the same account after signup.
          </div>
        </aside>

        <section className="auth-main">
          <a href="/" className="auth-back">
            <BackIcon />
            Back to store
          </a>

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-sub">Free for buyers. Upgrade to a supplier storefront anytime.</p>

          <form className="auth-form">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="input"
                  placeholder="Jordan Lee"
                />
              </div>
              <div className="field">
                <label htmlFor="business">Business name</label>
                <input
                  id="business"
                  name="business"
                  type="text"
                  required
                  autoComplete="organization"
                  className="input"
                  placeholder="Lee & Co. Retail"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@business.com"
              />
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="input"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Create account
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <a href="/auth/login">Sign in</a>
          </p>
        </section>
      </div>
    </main>
  );
}
