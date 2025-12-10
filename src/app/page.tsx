"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ViralVideosSection from "@/components/ViralVideosSection";
import TrendsSection from "@/components/TrendsSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroBgRef = useRef(null);
  const viralVideosRef = useRef(null);
  const viralVideosBgRef = useRef(null);
  const viralVideosTextRef = useRef(null);
  const trendsRef = useRef(null);
  const trendsTextRef = useRef(null);
  const navLogoRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef(null);
  const pricingCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure Viral Videos text is immediately visible
      gsap.set(viralVideosTextRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      // Hero Section: Parallax background
      gsap.to(heroBgRef.current, {
        y: 300,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Hero text fade out as you scroll
      gsap.to(heroTextRef.current, {
        opacity: 0,
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "80% top",
          scrub: true,
        },
      });

      // Pin the Viral Videos section from page load - it stays fixed as hero scrolls out
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        pin: viralVideosRef.current,
        pinSpacing: false,
      });

      // Change nav logo color from white to black when hero exits
      gsap.to(navLogoRef.current, {
        color: "#000000",
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "80% top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Trends Section: Title text fade in animation
      gsap.fromTo(
        trendsTextRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: trendsRef.current,
            start: "top 70%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Pricing Cards: Staggered reveal animation
      gsap.fromTo(
        pricingCardsRef.current,
        {
          opacity: 0,
          y: 80,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: pricingRef.current,
            start: "top 70%",
            end: "top 30%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-white overflow-x-hidden">
      <Navigation navLogoRef={navLogoRef} />

      <HeroSection
        heroRef={heroRef}
        heroTextRef={heroTextRef}
        heroBgRef={heroBgRef}
      />

      <ViralVideosSection
        viralVideosRef={viralVideosRef}
        viralVideosBgRef={viralVideosBgRef}
        viralVideosTextRef={viralVideosTextRef}
      />

      <TrendsSection
        trendsRef={trendsRef}
        trendsTextRef={trendsTextRef}
      />

      <PricingSection pricingRef={pricingRef} pricingCardsRef={pricingCardsRef} />

      <Footer />
    </div>
  );
}
