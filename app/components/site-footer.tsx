import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="B2B Wholesale Marketplace home">
              <span className="brand-mark">B2B</span>
              <span>
                <span className="brand-name">B2B WHOLESALE</span>
                <span className="brand-sub">Marketplace</span>
              </span>
            </Link>
            <p className="footer-copy">
              The wholesale marketplace for modern apparel retailers. Verified suppliers,
              transparent pricing, and low minimums — from first order to full scale.
            </p>
          </div>

          <div className="footer-col">
            <h4>Catalog</h4>
            <ul>
              <li><Link href="/#categories">Men&apos;s clothing</Link></li>
              <li><Link href="/#categories">Women&apos;s clothing</Link></li>
              <li><Link href="/#categories">Kids&apos; clothing</Link></li>
              <li><Link href="/#categories">Accessories</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>For business</h4>
            <ul>
              <li><Link href="/auth/register">Buyer account</Link></li>
              <li><Link href="/products/new">Become a supplier</Link></li>
              <li><Link href="/dashboard/wholesaler">Wholesaler dashboard</Link></li>
              <li><Link href="/dashboard/client">Client dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/#benefits">Help center</Link></li>
              <li><Link href="/#benefits">Shipping &amp; returns</Link></li>
              <li><Link href="/#benefits">Buyer protection</Link></li>
              <li><Link href="/auth/login">Sign in</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 B2B Wholesale Marketplace. All rights reserved.</span>
          <span>
            <Link href="/#benefits">Terms</Link>
            {" · "}
            <Link href="/#benefits">Privacy</Link>
            {" · "}
            <Link href="/#benefits">Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
