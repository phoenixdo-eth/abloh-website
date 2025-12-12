"use client";

import { RefObject } from "react";
import HeroText from "@/components/HeroText";
import TypewriterText from "@/components/TypewriterText";

interface ViralVideosSectionProps {
  viralVideosRef: RefObject<HTMLElement | null>;
  viralVideosBgRef: RefObject<HTMLDivElement | null>;
  viralVideosTextRef: RefObject<HTMLDivElement | null>;
}

export default function ViralVideosSection({ viralVideosRef, viralVideosBgRef, viralVideosTextRef }: ViralVideosSectionProps) {
  return (
    <section
      ref={viralVideosRef}
      className="absolute top-0 left-0 right-0 h-screen w-full px-0 md:px-6 lg:px-10 overflow-hidden z-10"
    >
      <div className="relative h-full w-full">
        <div
          ref={viralVideosBgRef}
          className="absolute inset-0 bg-gray-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative h-full flex items-center justify-center">
          <div ref={viralVideosTextRef}>
            <HeroText
              subtitle="DISCOVER STUDIO ABLOH"
              titleLine1="Viral Videos"
              titleLine2={
                <>
                  High <TypewriterText prefix="Qua" words={["lity", "ntity"]} cycleDelay={1000} />
                </>
              }
              paragraphLeft="Our creative studio redefines the potential of advertising, marketing, and storytelling. Find out who we are, and learn more about where we're going."
              paragraphRight=""
              paragraphColumn="left"
              textColor="text-black"
              subtitleColor="text-gray-500"
              paragraphColor="text-gray-600"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
