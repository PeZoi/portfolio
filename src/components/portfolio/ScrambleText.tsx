"use client";

import React, { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number; // Thời gian chạy hiệu ứng, mặc định là 800ms
  triggerOnHover?: boolean; // Tự động trigger lại hiệu ứng khi di chuột qua
}

const CHARS = "$_%@#&*+=?!0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function ScrambleText({
  text,
  className = "",
  duration = 800,
  triggerOnHover = true,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const isScramblingRef = useRef(false);

  const startScramble = () => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;

    const length = text.length;
    const steps = 15;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            // Nếu ký tự là khoảng trắng, giữ nguyên
            if (char === " ") return " ";

            // Tỷ lệ ký tự đã được giải mã tăng dần theo số step
            const isDecoded = index / length < step / steps;
            if (isDecoded) {
              return char;
            }
            // Trả về ký tự xáo trộn ngẫu nhiên
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      step++;
      if (step > steps) {
        clearInterval(interval);
        setDisplayText(text);
        isScramblingRef.current = false;
      }
    }, stepDuration);
  };

  useEffect(() => {
    startScramble();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span
      className={className}
      onMouseEnter={() => {
        if (triggerOnHover) startScramble();
      }}
    >
      {displayText}
    </span>
  );
}
