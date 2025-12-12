export default function Footer() {
  return (
    <footer className="relative bg-black py-20 px-0 md:px-6 lg:px-16 z-20 rounded-t-4xl">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Tagline */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <svg className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80" viewBox="0 0 24 24">
              <rect x="0" y="0" width="8" height="24" fill="red"/>
              <rect x="8" y="0" width="8" height="24" fill="blue"/>
              <rect x="16" y="0" width="8" height="24" fill="green"/>
            </svg>
          </div>

          {/* Main Tagline */}
          <div className="text-center md:text-right">
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-serif leading-tight text-white">
              Start Today.
              <br />
              Print Tomorrow.
            </h2>
          </div>
        </div>

        {/* Navigation and Legal Links */}
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center flex-wrap gap-8">
          {/* Left - Legal Links */}
          <div className="flex items-center justify-center gap-4 md:gap-6 text-xs text-gray-400 flex-wrap">
            <span>© 2025 Abloh</span>
            <a href="#" className="hover:opacity-70 transition-opacity">
              Privacy Policy
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity">
              Terms & Conditions
            </a>
          </div>

          {/* Right - Navigation Links */}
          <div className="flex items-center justify-center gap-4 md:gap-8 lg:gap-12 flex-wrap text-white">
            <a href="#" className="text-xs md:text-sm font-medium tracking-widest hover:opacity-70 transition-opacity">
              VIDEO PRODUCTION
            </a>
            <a href="#" className="text-xs md:text-sm font-medium tracking-widest hover:opacity-70 transition-opacity">
              BRAND STRATEGY
            </a>
            <a href="#" className="text-xs md:text-sm font-medium tracking-widest hover:opacity-70 transition-opacity">
              SOCIAL MEDIA
            </a>
            <a href="#" className="text-xs md:text-sm font-medium tracking-widest hover:opacity-70 transition-opacity">
              CREATIVE STUDIO
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
