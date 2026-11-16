import Link from "next/link";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="announce-bar">
        <div className="announce-inner">
          <span className="announce-pill">Wholesale</span>
          <span>Free catalog access for verified buyers · Low MOQs from 12 units · New season SS26 now live</span>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="B2B Wholesale Marketplace home">
            <span className="brand-mark">B2B</span>
            <span>
              <span className="brand-name">B2B WHOLESALE</span>
              <span className="brand-sub">Marketplace</span>
            </span>
          </Link>

          <form className="header-search" role="search" action="/">
            <div className="search-shell">
              <SearchIcon />
              <input
                type="search"
                name="q"
                placeholder="Search apparel, fabrics, suppliers…"
                aria-label="Search the wholesale catalog"
              />
              <button type="submit" className="search-submit">Search</button>
            </div>
          </form>

          <div className="header-actions">
            <Link href="/products/new" className="header-link">Sell on B2B</Link>
            <Link href="/dashboard/wholesaler" className="header-link">Dashboard</Link>
            <Link href="/auth/login" className="header-link">Sign in</Link>
            <Link href="/auth/register" className="btn btn-primary header-cta">Get started</Link>
          </div>
        </div>

        <nav className="main-nav" aria-label="Catalog categories">
          <div className="container nav-inner">
            <Link href="/" className="nav-link nav-link--active">Home</Link>
            <Link href="/#categories" className="nav-link">Men&apos;s</Link>
            <Link href="/#categories" className="nav-link">Women&apos;s</Link>
            <Link href="/#categories" className="nav-link">Kids&apos;</Link>
            <Link href="/#categories" className="nav-link">Accessories</Link>
            <Link href="/#featured" className="nav-link">New arrivals</Link>
            <Link href="/products/new" className="nav-link">Become a supplier</Link>
            <Link href="/#featured" className="nav-link nav-link--accent">Deals</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
