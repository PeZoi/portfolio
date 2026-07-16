"use client";

import React, { useState, useRef, useEffect } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Góc xoay tối đa, mặc định là 8 độ
}

export function TiltCard({ children, className = "", maxTilt = 8 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Kiểm tra xem thiết bị di động có màn hình cảm ứng không hoặc yêu cầu giảm hiệu ứng động
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) {
      return;
    }

    if (isHovered && cardRef.current) {
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      
      const x = coords.x - rect.left - rect.width / 2;
      const y = coords.y - rect.top - rect.height / 2;

      // Tính toán tỉ lệ xoay
      const rotateX = -(y / (rect.height / 2)) * maxTilt;
      const rotateY = (x / (rect.width / 2)) * maxTilt;

      // Tính vị trí Spotlight cục bộ của card
      const spotlightX = coords.x - rect.left;
      const spotlightY = coords.y - rect.top;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.005, 1.005, 1.005)`,
        transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out",
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.08)",
        zIndex: 10,
        // Cập nhật vị trí Spotlight cục bộ của card qua biến CSS
        "--card-spotlight-x": `${spotlightX}px`,
        "--card-spotlight-y": `${spotlightY}px`,
      } as React.CSSProperties);
    } else {
      // Khi không hover, reset mượt mà về trạng thái cũ
      setTiltStyle({
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "none",
        "--card-spotlight-x": "-999px",
        "--card-spotlight-y": "-999px",
      } as React.CSSProperties);
    }
  }, [coords, isHovered, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-300 group ${className}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Lớp phủ phản xạ ánh sáng (Spotlight cục bộ trên card) */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-[inherit]"
        style={{
          background: `
            radial-gradient(
              250px circle at var(--card-spotlight-x, -999px) var(--card-spotlight-y, -999px),
              rgba(255, 255, 255, 0.06) 0%,
              transparent 80%
            )
          `
        }}
      />
      {children}
    </div>
  );
}
