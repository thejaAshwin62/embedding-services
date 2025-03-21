import React, { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

// Utility function for conditional className merging


export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!animate) return;
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      if (!container) return;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      container.style.setProperty("--x", x.toString());
      container.style.setProperty("--y", y.toString());
    };

    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [animate]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-white rounded-lg overflow-hidden",
        containerClassName
      )}
    >
      <div
        className={cn(
          "relative z-10 w-full h-full bg-white flex items-center justify-center",
          className
        )}
      >
        {children}
      </div>
      <div className="glow absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};
