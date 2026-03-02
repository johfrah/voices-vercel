"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface FloatingParticlesProps {
  element?: string;
  isPlaying: boolean;
}

const elementColors: Record<string, { r: number, g: number, b: number }> = {
  aarde: { r: 139, g: 69, b: 19 },    // Brown
  water: { r: 30, g: 144, b: 255 },   // Blue
  lucht: { r: 135, g: 206, b: 250 },  // Light blue
  vuur: { r: 255, g: 69, b: 0 },      // Orange red
  default: { r: 255, g: 255, b: 255 }
};

export const FloatingParticles = ({ element = 'default', isPlaying }: FloatingParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles (reduced to 20 for better mobile performance)
    if (particlesRef.current.length === 0) {
      const particleCount = window.innerWidth < 768 ? 15 : 20; // Less on mobile
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    }

    // FPS throttling (30 FPS for better performance)
    let lastFrameTime = 0;
    const fpsInterval = 1000 / 30;

    const animate = (currentTime: number) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const elapsed = currentTime - lastFrameTime;
      if (elapsed < fpsInterval) return;
      
      lastFrameTime = currentTime - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const color = elementColors[element] || elementColors.default;

      particlesRef.current.forEach((particle) => {
        if (isPlaying) {
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${particle.opacity})`;
        ctx.fill();
      });
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [element, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
};
