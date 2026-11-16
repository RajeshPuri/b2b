"use client";

import { useState } from 'react';

export default function HeroSection() {
  const [showStats, setShowStats] = useState(false);

  return (
    <section className="hero">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-4">
          Connecting Quality
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl">
          We connect verified wholesalers with business buyers across the globe.
          Browse premium clothing collections, place enquiries, and grow your
          business with trusted partners.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <a
            href="/auth/login"
            className="btn btn-primary btn-block"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="btn btn-outline btn-block"
          >
            Register
          </a>
        </div>
      </div>
    </section>
  );
}