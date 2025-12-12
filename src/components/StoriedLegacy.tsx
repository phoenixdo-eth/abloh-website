"use client";

import { useEffect, useState } from "react";

const topImages = [
  "/images/story-1.jpg",
  "/images/story-2.jpg",
  "/images/story-3.jpg",
];

const bottomImages = [
  "/images/story-4.jpg",
  "/images/story-5.jpg",
  "/images/story-6.jpg",
];

export default function StoriedLegacy() {
  const [topImageIndex, setTopImageIndex] = useState(0);
  const [bottomImageIndex, setBottomImageIndex] = useState(0);

  useEffect(() => {
    const topInterval = setInterval(() => {
      setTopImageIndex((prev) => (prev + 1) % topImages.length);
    }, 3000);

    const bottomInterval = setInterval(() => {
      setBottomImageIndex((prev) => (prev + 1) % bottomImages.length);
    }, 3500);

    return () => {
      clearInterval(topInterval);
      clearInterval(bottomInterval);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-[#F5F1EB] py-32 px-4 md:px-6 lg:px-16 z-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm tracking-widest text-gray-500 mb-4">OUR HISTORY</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side - "A storied" */}
          <div className="lg:col-span-5">
            <h2 className="text-7xl md:text-8xl lg:text-9xl font-serif leading-none mb-8">
              A storied
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-md">
              For more than 75 years, we&apos;ve pointed our compass toward new
              paths, people, and possibilities. And we&apos;re just getting started.
            </p>

            {/* Bottom Left Images Grid */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {bottomImages.map((img, index) => (
                <div
                  key={index}
                  className={`aspect-[3/4] relative overflow-hidden rounded-lg transition-opacity duration-1000 ${
                    index === bottomImageIndex ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Center - Circular Timeline Badge */}
          <div className="lg:col-span-2 flex justify-center items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              {/* Circular text path */}
              <svg
                className="absolute inset-0 w-full h-full animate-spin-slow"
                viewBox="0 0 200 200"
              >
                <defs>
                  <path
                    id="circlePath"
                    d="M 100, 100 m -80, 0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
                  />
                </defs>
                <text className="text-[10px] fill-gray-600 tracking-wider">
                  <textPath xlinkHref="#circlePath" startOffset="0%">
                    TAP TO EXPLORE THE TIMELINE • TAP TO EXPLORE THE TIMELINE •{" "}
                  </textPath>
                </text>
              </svg>

              {/* Center Badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2">
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <circle cx="12" cy="12" r="10" fill="#2D5F3F" />
                        <path
                          d="M12 6v6M12 14v6"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9 9l3-3 3 3M9 15l3 3 3-3"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - "legacy." */}
          <div className="lg:col-span-5">
            <h2 className="text-7xl md:text-8xl lg:text-9xl font-serif leading-none mb-8">
              legacy.
            </h2>

            {/* Top Right Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              {topImages.map((img, index) => (
                <div
                  key={index}
                  className={`aspect-[4/3] relative overflow-hidden rounded-lg transition-opacity duration-1000 ${
                    index === topImageIndex ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
