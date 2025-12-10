"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import HeroText from "@/components/HeroText";
import CursorTrail from "@/components/CursorTrail";

interface HeroSectionProps {
  heroRef: RefObject<HTMLElement | null>;
  heroTextRef: RefObject<HTMLDivElement | null>;
  heroBgRef: RefObject<HTMLDivElement | null>;
}

export default function HeroSection({ heroRef, heroTextRef, heroBgRef }: HeroSectionProps) {
  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full pb-4 md:pb-6 lg:pb-10 px-4 md:px-6 lg:px-10 overflow-hidden z-30"
    >
      {/* <CursorTrail /> */}
      <div className="relative h-full w-full overflow-hidden rounded-b-4xl">
        <div
          ref={heroBgRef}
          className="absolute inset-0 bg-black -top-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            willChange: 'transform'
          }}
        />

        <div ref={heroTextRef} className="relative h-full flex items-center justify-center text-white">
          <div>
            <HeroText
              subtitle="MORE THAN CONTENT"
              titleLine1="Welcome to"
              titleLine2="Abloh Studio."
              paragraphLeft="Our story began in a small apartment that thought it could be onto something bigger."
              paragraphRight="Seventy-five days into building on that legacy, we're aiming even higher."
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8">
          <div className="w-12 h-20 border-2 border-white rounded-full flex flex-col items-center justify-center py-2 text-white">
            <motion.svg
              className="w-6 h-6 -mb-3"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              strokeWidth={2}
              initial={{ opacity: 0, y: -5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-5, 0, 5, 10]
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.15, 0.7, 1],
                repeat: Infinity,
                delay: 1.2
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
            <motion.svg
              className="w-7 h-7 -mb-3"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              strokeWidth={2}
              initial={{ opacity: 0, y: -5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-5, 0, 5, 10]
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.15, 0.7, 1],
                repeat: Infinity,
                delay: 1.4
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
            <motion.svg
              className="w-8 h-8"
              fill="none"
              stroke="white"
              viewBox="0 0 24 24"
              strokeWidth={2}
              initial={{ opacity: 0, y: -5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [-5, 0, 5, 10]
              }}
              transition={{
                duration: 1.5,
                times: [0, 0.15, 0.7, 1],
                repeat: Infinity,
                delay: 1.6
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </div>
        </div>
      </div>
    </section>
  );
}
