"use client";

export default function FeaturesSection() {
  return (
    <section className="mt-16 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-b2b-primary mb-8">Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="📦"
          title="Product Catalog"
          description="Browse thousands of verified clothing products with detailed specifications"
        />
        <FeatureCard
          icon="📄"
          title="Order Management"
          description="Create, track, and manage orders from enquiry to delivery"
        />
        <FeatureCard
          icon="💰"
          title="Invoice & Payment"
          description="Secure invoicing, payment tracking, and financial reporting"
        />
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card p-6 text-left">
      <div className="h-12 w-12 rounded-md flex items-center justify-center mb-4 bg-b2b-primary/10">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl font-medium text-b2b-primary mb-2">{title}</h3>
      <p className="text-b2b-text-secondary">{description}</p>
    </div>
  );
}