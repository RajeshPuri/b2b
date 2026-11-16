import { Metadata } from "next";
import { LoginForm } from "../../components/login-form";

export const metadata: Metadata = {
  title: "Sign In — B2B Wholesale Marketplace",
  description: "Sign in to your B2B wholesale clothing marketplace account",
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

export default function LoginPage() {
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
              Wholesale buying,
              <br />
              <span className="accent">without the friction.</span>
            </h1>
            <p className="auth-aside-copy">
              One account for verified suppliers, transparent per-unit pricing, and reorders
              across your entire catalog.
            </p>

            <div className="auth-points">
              <div className="auth-point">
                <span className="auth-point-icon"><ShieldIcon /></span>
                Verified suppliers and buyer protection
              </div>
              <div className="auth-point">
                <span className="auth-point-icon"><TagIcon /></span>
                Tiered pricing visible from day one
              </div>
              <div className="auth-point">
                <span className="auth-point-icon"><TruckIcon /></span>
                Low MOQs with reliable reorders
              </div>
            </div>
          </div>

          <div className="auth-aside-foot">
            Trusted by 2,400+ independent retailers and 180+ verified suppliers.
          </div>
        </aside>

        <section className="auth-main">
          <a href="/" className="auth-back">
            <BackIcon />
            Back to store
          </a>

          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-sub">Sign in to manage orders, quotes, and your catalog.</p>

          <LoginForm />

          <div className="demo-hint">
            <TagIcon />
            <span>
              Demo accounts: <b>wholesaler@b2b.com</b> / <b>wholesale123</b> ·{" "}
              <b>client@b2b.com</b> / <b>client123</b> · <b>admin@b2b.com</b> / <b>admin123</b>
            </span>
          </div>

          <p className="auth-footer">
            New to B2B Wholesale? <a href="/auth/register">Create a free account</a>
          </p>
        </section>
      </div>
    </main>
  );
}
