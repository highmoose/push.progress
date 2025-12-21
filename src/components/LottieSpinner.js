"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import animationData from "@/../public/spinner/Push.json";

export default function LottieSpinner({ size = 120, opacity = 0.15 }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: animationData,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        opacity: opacity,
      }}
    />
  );
}
