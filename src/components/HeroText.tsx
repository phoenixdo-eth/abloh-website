import { ReactNode } from "react";

interface HeroTextProps {
  subtitle: string;
  titleLine1: string;
  titleLine2: string | ReactNode;
  paragraphLeft: string;
  paragraphRight: string;
  paragraphColumn?: "left" | "right";
  textColor?: string;
  subtitleColor?: string;
  paragraphColor?: string;
}

export default function HeroText({
  subtitle,
  titleLine1,
  titleLine2,
  paragraphLeft,
  paragraphRight,
  paragraphColumn = "right",
  textColor = "text-white",
  subtitleColor = "",
  paragraphColor = "",
}: HeroTextProps) {
  return (
    <div className={`${textColor} w-[50vw] mx-auto`}>
      {/* Row 1: Subtitle */}
      <p className={`text-xs uppercase tracking-widest mb-6 text-left font-[Arial,sans-serif] ${subtitleColor || ""}`}>
        {subtitle}
      </p>

      {/* Row 2: Title Line 1 (Leading) */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight mb-2 text-left">
        {titleLine1}
      </h1>

      {/* Row 3: Title Line 2 (Trailing) */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight mb-8 text-right">
        {titleLine2}
      </h1>

      {/* Row 4: Two Column Paragraphs */}
      <div className={`grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-base md:text-lg leading-relaxed ${paragraphColor || ""}`}>
        {paragraphColumn === "left" ? (
          <>
            <p className="text-left font-[Arial,sans-serif]">
              {paragraphLeft} {paragraphRight}
            </p>
            <div></div>
          </>
        ) : (
          <>
            <div></div>
            <p className="text-left font-[Arial,sans-serif]">
              {paragraphLeft} {paragraphRight}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
