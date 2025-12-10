"use client";

import { RefObject } from "react";

interface PricingSectionProps {
  pricingRef: RefObject<HTMLElement | null>;
  pricingCardsRef: RefObject<(HTMLDivElement | null)[]>;
}

export default function PricingSection({ pricingRef, pricingCardsRef }: PricingSectionProps) {
  const pricingTiers = [
    {
      name: "Starter",
      price: "$1,999",
      period: "/month",
      description: "Perfect for small businesses and startups looking to establish their brand.",
      features: [
        "2 Videos per Month",
        "Basic Editing",
        "Social Media Optimization",
        "2 Revisions per Video",
        "7-Day Delivery",
      ],
    },
    {
      name: "Professional",
      price: "$3,999",
      period: "/month",
      description: "Ideal for growing businesses that need comprehensive content solutions.",
      features: [
        "4 Videos per Month",
        "Advanced Editing & Effects",
        "Multi-Platform Optimization",
        "Brand Strategy Consultation",
        "5 Revisions per Video",
        "5-Day Delivery",
      ],
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large-scale campaigns and ongoing partnerships.",
      features: [
        "Unlimited Videos",
        "Premium Editing Suite",
        "Complete Campaign Management",
        "Dedicated Account Manager",
        "Unlimited Revisions",
        "Priority Support",
      ],
    },
  ];

  return (
    <section ref={pricingRef} className="relative min-h-screen w-full px-4 md:px-6 lg:px-10 overflow-hidden z-20">
      <div className="relative w-full bg-white py-16 md:py-32">
        {/* Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-widest text-gray-500 mb-4">INVESTMENT</p>
          <h2 className="text-5xl md:text-6xl font-serif mb-4">Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect package for your vision
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              ref={(el) => { pricingCardsRef.current[index] = el; }}
              className={`relative bg-black rounded-3xl p-8 flex flex-col ${
                tier.featured ? "ring-2 ring-white shadow-2xl scale-105" : ""
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-xs font-medium tracking-wider border-2 border-black">
                  MOST POPULAR
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-gray-400">{tier.period}</span>}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-8 flex-grow">{tier.description}</p>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-white flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 ${
                  tier.featured
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-white text-black hover:bg-gray-100 border border-white"
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
