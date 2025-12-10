"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HeroText from "@/components/HeroText";

export default function Home() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  return (
    <div ref={containerRef} className="bg-white overflow-x-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent text-white pointer-events-none"
      >
        <div className="flex items-center justify-between px-6 md:px-8 lg:px-16 py-6">
          <div className="flex items-center gap-2 mix-blend-difference">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 6 8 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8 12 2 12 2Z"/>
            </svg>
            <span className="text-2xl font-medium tracking-wider">ABLOH</span>
          </div>
          <button className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 pointer-events-auto">
            MENU
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 6 8 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8 12 2 12 2Z"/>
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Exploring Section - Fixed, never moves */}
      <div className="fixed top-0 left-0 right-0 h-screen pb-4 md:pb-6 lg:pb-10 px-4 md:px-6 lg:px-10 z-10">
        <div className="relative h-full w-full bg-gray-50 py-32 px-8 flex items-center justify-center" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false, amount: 0.3 }}
          >
            <HeroText
              subtitle="DISCOVER ABLOH STUDIO"
              titleLine1="Viral Videos"
              titleLine2="High Quality"
              paragraphLeft="Our creative studio redefines the potential of advertising, marketing, and storytelling. Find out who we are, and learn more about where we're going."
              paragraphRight=""
              paragraphColumn="left"
              textColor="text-black"
              subtitleColor="text-gray-500"
              paragraphColor="text-gray-600"
            />
          </motion.div>
        </div>
      </div>

      {/* Hero Section - Scrolls normally */}
      <section
        ref={heroRef}
        className="relative h-screen w-full pb-4 md:pb-6 lg:pb-10 px-4 md:px-6 lg:px-10 z-20"
      >
          <div className="relative h-full w-full overflow-hidden rounded-b-4xl">
            <div className="absolute inset-0 bg-black" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}>
              {/* Mountain background placeholder */}
            </div>

            <div className="relative h-full flex items-center justify-center text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <HeroText
                  subtitle="MORE THAN CONTENT"
                  titleLine1="Welcome to"
                  titleLine2="Abloh Studio."
                  paragraphLeft="Our story began in a small apartment that thought it could be onto something bigger."
                  paragraphRight="Seventy-five days into building on that legacy, we're aiming even higher."
                />
              </motion.div>
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

      {/* Spacer so exploring section stays visible */}
      <div className="h-screen" />

      {/* Split Section 1 - Aspen Snowmass (Black Background) */}
      <section className="relative h-screen p-4 md:p-6 lg:p-8">
        <div className="grid md:grid-cols-2 h-full overflow-hidden rounded-3xl">
          {/* Image Side */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.3 }}
            className="relative h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-slate-300 to-blue-100">
              {/* Skiing image placeholder */}
            </div>
          </motion.div>

          {/* Text Side */}
          <div className="relative h-full bg-black text-white flex items-center justify-center p-8 md:p-16">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
              className="max-w-lg"
            >
              <p className="text-xs uppercase tracking-widest mb-6 text-gray-400">OUR BRANDS</p>
              <div className="flex items-center gap-4 mb-8">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 6 8 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8 12 2 12 2Z"/>
                </svg>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold">ASPEN</h2>
                  <h2 className="text-4xl md:text-5xl font-bold">SNOWMASS</h2>
                </div>
              </div>
              <p className="text-base md:text-lg leading-relaxed mb-8">
                Four mountains. Two apartments. One unforgettable experience at the confluence of nature, culture, and recreation.
              </p>
              <button className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Discover Aspen Snowmass
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Split Section 2 - Aspen Hospitality (White Background) */}
      <section className="relative h-screen p-4 md:p-6 lg:p-8">
        <div className="grid md:grid-cols-2 h-full overflow-hidden rounded-3xl">
          {/* Image Side */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.3 }}
            className="relative h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-stone-200 to-slate-100">
              {/* Pool/hospitality image placeholder */}
            </div>
          </motion.div>

          {/* Text Side */}
          <div className="relative h-full bg-white text-black flex items-center justify-center p-8 md:p-16">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
              className="max-w-lg"
            >
              <p className="text-xs uppercase tracking-widest mb-6 text-gray-500">OUR BRANDS</p>
              <div className="flex items-center gap-4 mb-8">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 6 8 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8 12 2 12 2Z"/>
                </svg>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold">ASPEN</h2>
                  <h2 className="text-4xl md:text-5xl font-bold">HOSPITALITY</h2>
                </div>
              </div>
              <p className="text-base md:text-lg leading-relaxed mb-8">
                From soaring peaks to sea-level streets, we help travelers discover their best selves.
              </p>
              <button className="px-8 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Discover Aspen Hospitality
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Split Section 3 - Aspen Ventures (Black Background) */}
      <section className="relative h-screen p-4 md:p-6 lg:p-8">
        <div className="grid md:grid-cols-2 h-full overflow-hidden rounded-3xl">
          {/* Image Side */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.3 }}
            className="relative h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-slate-200">
              {/* Ventures image placeholder */}
            </div>
          </motion.div>

          {/* Text Side */}
          <div className="relative h-full bg-black text-white flex items-center justify-center p-8 md:p-16">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
              className="max-w-lg"
            >
              <p className="text-xs uppercase tracking-widest mb-6 text-gray-400">OUR BRANDS</p>
              <div className="flex items-center gap-4 mb-8">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C12 2 6 8 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8 12 2 12 2Z"/>
                </svg>
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold">ASPEN</h2>
                  <h2 className="text-4xl md:text-5xl font-bold">VENTURES</h2>
                </div>
              </div>
              <p className="text-base md:text-lg leading-relaxed mb-8">
                Aspen Ventures is the innovation engine of Abloh Studio. It aims to globally amplify Abloh Studio's vision to renew the mind, body, and spirit.
              </p>
              <button className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Discover Aspen Ventures
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Storied Legacy Section */}
      <section className="py-32 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.3 }}
            className="text-center mb-20"
          >
            <p className="text-xs uppercase tracking-widest mb-6 text-gray-500">OUR HISTORY</p>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">A storied<br/>legacy.</h2>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              For more than 75 days, we've pointed our compass toward new paths, people, and possibilities. And we're just getting started.
            </p>
          </motion.div>

          {/* Image Grid with Circular Logo */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: false, amount: 0.3 }}
              className="aspect-square bg-gradient-to-br from-slate-600 to-slate-400 rounded-3xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
              className="aspect-square bg-gradient-to-br from-red-300 to-orange-200 rounded-3xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: false, amount: 0.3 }}
              className="aspect-square bg-gradient-to-br from-gray-400 to-gray-300 rounded-3xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: false, amount: 0.3 }}
              className="aspect-square bg-gradient-to-br from-blue-300 to-slate-300 rounded-3xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: false, amount: 0.3 }}
              className="aspect-square bg-gradient-to-br from-orange-200 to-yellow-100 rounded-3xl"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: false, amount: 0.3 }}
              className="aspect-square bg-gradient-to-br from-slate-500 to-slate-300 rounded-3xl"
            ></motion.div>
          </div>
        </div>
      </section>

      {/* Sustainability Full Screen Section */}
      <section className="relative h-screen p-4 md:p-6 lg:p-8">
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          <motion.div
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: false, amount: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-400"
          >
            {/* Forest background placeholder */}
          </motion.div>

          <div className="relative h-full flex items-center justify-center text-white px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: false, amount: 0.5 }}
              className="max-w-3xl text-center md:text-left"
            >
              <p className="text-xs uppercase tracking-widest mb-6">OUR COMMITMENT</p>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
                A sustainable<br/>future.
              </h2>
              <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
                We're improving the sustainability of our business at every touch point. But using our voice and influence to tackle climate change at a policy level—that's our greatest sustainability superpower.
              </p>
              <button className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Learn more
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Careers Split Section */}
      <section className="relative h-screen p-4 md:p-6 lg:p-8">
        <div className="grid md:grid-cols-2 h-full overflow-hidden rounded-3xl bg-black">
          {/* Image Side */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.3 }}
            className="relative h-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-300 to-purple-200">
              {/* Careers image placeholder */}
            </div>
          </motion.div>

          {/* Text Side */}
          <div className="relative h-full text-white flex items-center justify-center p-8 md:p-16">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: false, amount: 0.5 }}
              className="max-w-lg"
            >
              <p className="text-xs uppercase tracking-widest mb-6 text-gray-400">CAREERS</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                Opportunities<br/>that take you<br/>higher.
              </h2>
              <p className="text-base md:text-lg leading-relaxed mb-8">
                Live fully, live purposefully. Become a part of our values-driven team and help shape a legacy of tight-knit community and trailblazing culture. From mountain operations and retail positions to working in hospitality or within our corporate team—here, the diversity of roles and opportunities for career growth are unmatched.
              </p>
              <button className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
                Discover our careers
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-black py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <svg className="w-20 h-20 mb-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C12 2 6 8 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8 12 2 12 2Z"/>
            </svg>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Abloh Studio.</h3>
            <h4 className="text-4xl md:text-5xl lg:text-6xl font-bold">Endless Possibilities.</h4>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mb-12 text-sm font-medium">
            <a href="#" className="hover:underline">ASPEN SNOWMASS</a>
            <a href="#" className="hover:underline">THE LITTLE NELL</a>
            <a href="#" className="hover:underline">LIMELIGHT HOTELS</a>
            <a href="#" className="hover:underline">ASPEN COLLECTION</a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
            <span>© 2025 Aspen</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms & Conditions</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
