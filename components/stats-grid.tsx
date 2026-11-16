"use client";

export default function StatsGrid() {
  return (
    <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      <div className="card p-6 text-center">
        <div className="text-4xl font-bold text-b2b-primary mb-2">150+</div>
        <p className="text-b2b-text-secondary">Verified Wholesalers</p>
      </div>
      <div className="card p-6 text-center">
        <div className="text-4xl font-bold text-b2b-primary mb-2">5000+</div>
        <p className="text-b2b-text-secondary">Premium Products</p>
      </div>
      <div className="card p-6 text-center">
        <div className="text-4xl font-bold text-b2b-primary mb-2">98%</div>
        <p className="text-b2b-text-secondary">Satisfaction Rate</p>
      </div>
    </section>
  );
}