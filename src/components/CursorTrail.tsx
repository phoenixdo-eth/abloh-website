"use client";

import { useEffect, useRef } from "react";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  width: number;
  height: number;
  color: string;
  createdAt: number;
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trailPoints = useRef<TrailPoint[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | undefined>(undefined);
  const lastTrailPos = useRef({ x: 0, y: 0 });
  const lastColor = useRef<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse position relative to canvas
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only add trail points if mouse is within canvas bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mousePos.current = { x, y };

        // Initialize last position if this is the first move
        if (lastTrailPos.current.x === 0 && lastTrailPos.current.y === 0) {
          lastTrailPos.current = { x, y };
          return;
        }

        // Calculate distance moved since last trail point
        const dx = x - lastTrailPos.current.x;
        const dy = y - lastTrailPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Add trail point when cursor moves 150 pixels
        if (distance >= 150) {
          lastTrailPos.current = { x, y };

          // Add new trail point with randomized aspect ratio
          const baseSize = 200;
          const isWidthLonger = Math.random() > 0.5;

          // RGB palette - exclude last color to prevent repeats
          const colors = ['red', 'blue', 'green'];
          const availableColors = colors.filter(color => color !== lastColor.current);
          const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
          lastColor.current = randomColor;

          trailPoints.current.push({
            x,
            y,
            opacity: 1,
            width: isWidthLonger ? baseSize * 1.5 : baseSize,
            height: isWidthLonger ? baseSize : baseSize * 1.5,
            color: randomColor,
            createdAt: Date.now(),
          });

          // Limit trail length
          if (trailPoints.current.length > 30) {
            trailPoints.current.shift();
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw trail points
      const currentTime = Date.now();
      trailPoints.current = trailPoints.current.filter((point) => {
        const age = currentTime - point.createdAt;

        // Keep point for 2 seconds (2000ms)
        if (age < 2000) {
          // Draw rectangle
          ctx.fillStyle = point.color;
          ctx.fillRect(
            point.x - point.width / 2,
            point.y - point.height / 2,
            point.width,
            point.height
          );

          return true;
        }
        return false;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
