"use client";

import React, { useEffect, useRef } from 'react';

export const AudioWaveform = ({ isPlaying }: { isPlaying: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let bars = Array.from({ length: 40 }, () => Math.random() * 0.5 + 0.1);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bars.length;
      
      bars.forEach((bar, i) => {
        const height = isPlaying ? bar * canvas.height * (0.5 + Math.random() * 0.5) : bar * canvas.height * 0.2;
        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = isPlaying ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, height, 4);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full h-full opacity-60"
    />
  );
};
