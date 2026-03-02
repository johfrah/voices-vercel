"use client";

import { useEffect, useRef, useState } from "react";

interface AudioWaveformProps {
  isPlaying: boolean;
  centerX?: number;
  centerY?: number;
}

export const AudioWaveform = ({ isPlaying, centerX: propCenterX, centerY: propCenterY }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouseInfluence, setMouseInfluence] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Make canvas fullscreen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simulated frequency data since we don't have a real analyser node here
    let smoothing = 0;

    const draw = () => {
      const centerX = propCenterX ?? canvas.width / 2;
      const centerY = propCenterY ?? canvas.height / 2;
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.08;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simulate amplitude
      const simulatedAmplitude = isPlaying ? (0.3 + Math.random() * 0.4) : 0.15;
      
      const targetSmoothing = simulatedAmplitude;
      smoothing += (targetSmoothing - smoothing) * 0.1;
      
      const pulseRadius = baseRadius + (smoothing * 60);

      // Draw multiple concentric circles for depth
      const time = Date.now() / 1500;
      for (let i = 0; i < 4; i++) {
        const baseCircleRadius = pulseRadius + (i * 12);
        const opacity = (0.18 - i * 0.04) * (0.5 + smoothing * 1.5);
        
        ctx.beginPath();
        const circlePoints = 64;
        for (let j = 0; j <= circlePoints; j++) {
          const angle = (j / circlePoints) * Math.PI * 2;
          
          const wave1 = Math.sin(angle * 4 + time * (1 + i * 0.2)) * (3 + i * 1);
          const wave2 = Math.cos(angle * 6 - time * (0.8 + i * 0.15)) * (2 + i * 0.5);
          const organicOffset = wave1 + wave2;
          
          const radius = baseCircleRadius + organicOffset;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Draw flowing wave around circle
      const points = 72;
      const baseWave = 10 + smoothing * 20;
      
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        
        const wave1 = Math.sin(angle * 3 + time) * baseWave;
        const wave2 = Math.sin(angle * 5 - time * 0.7) * (baseWave * 0.6);
        const wave3 = Math.cos(angle * 2 + time * 0.5) * (baseWave * 0.4);
        
        const pointX = centerX + Math.cos(angle) * pulseRadius;
        const pointY = centerY + Math.sin(angle) * pulseRadius;
        const distToMouse = Math.sqrt(
          Math.pow(pointX - mousePos.x, 2) + Math.pow(pointY - mousePos.y, 2)
        );
        
        const mouseEffect = mouseInfluence * Math.max(0, 1 - distToMouse / 200) * 30;
        
        const totalWave = wave1 + wave2 + wave3 + mouseEffect;
        const radius = pulseRadius + totalWave;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 + smoothing * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, mousePos, mouseInfluence, propCenterX, propCenterY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setMouseInfluence(1);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 pointer-events-auto z-[5]"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  );
};
