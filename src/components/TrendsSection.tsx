"use client";

import { RefObject } from "react";
import HeroText from "@/components/HeroText";

interface TrendsSectionProps {
  trendsRef: RefObject<HTMLElement | null>;
  trendsTextRef: RefObject<HTMLDivElement | null>;
}

export default function TrendsSection({ trendsRef, trendsTextRef }: TrendsSectionProps) {
  return (
    <section ref={trendsRef} className="relative h-screen w-full px-0 md:px-6 lg:px-10 overflow-hidden z-20 mt-[100vh]">
      <div className="relative h-full w-full overflow-hidden rounded-b-4xl">
        {/* Grid Background */}
        <div
          className="absolute inset-0 bg-black"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative h-full flex items-center justify-center">
          <div ref={trendsTextRef}>
            <HeroText
              subtitle="WHAT WE OFFER"
              titleLine1="Find Trends"
              titleLine2="Track Winners"
              paragraphLeft="Find viral videos across social media to surface the best inspiration for your next campaign. Measure performance to identify your winners."
              paragraphRight=""
              paragraphColumn="left"
              textColor="text-white"
              subtitleColor="text-gray-400"
              paragraphColor="text-gray-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
