"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

const Tooltip = ({
  content,
  children,
  side = "top",
  delay = 200,
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (side) {
      case "top":
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
    }

    setPosition({ top, left });
  }, [side]);

  useEffect(() => {
    if (isVisible && mounted) {
      calculatePosition();
    }
  }, [isVisible, mounted, calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      calculatePosition();
    };

    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, calculatePosition]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformOrigin = () => {
    switch (side) {
      case "top":
        return "translate(-50%, -100%)";
      case "bottom":
        return "translate(-50%, 0%)";
      case "left":
        return "translate(-100%, -50%)";
      case "right":
        return "translate(0%, -50%)";
    }
  };

  const tooltipContent =
    isVisible && mounted
      ? createPortal(
          <div
            className={`
              fixed pointer-events-none z-50
              px-4 py-3 rounded-md text-sm font-medium
              whitespace-nowrap shadow-lg
              ${className}
            `}
            style={{
              top: `${position.top + window.scrollY}px`,
              left: `${position.left + window.scrollX}px`,
              transform: getTransformOrigin(),
              backgroundColor: "var(--foreground)",
              color: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                width: "8px",
                height: "8px",
                backgroundColor: "var(--foreground)",
                ...(side === "top" && {
                  bottom: "-5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderTop: "5px solid var(--foreground)",
                  width: "0",
                  height: "0",
                }),
                ...(side === "bottom" && {
                  top: "-5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  borderBottom: "5px solid var(--foreground)",
                  width: "0",
                  height: "0",
                }),
                ...(side === "left" && {
                  right: "-5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderLeft: "5px solid var(--foreground)",
                  width: "0",
                  height: "0",
                }),
                ...(side === "right" && {
                  left: "-5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderTop: "4px solid transparent",
                  borderBottom: "4px solid transparent",
                  borderRight: "5px solid var(--foreground)",
                  width: "0",
                  height: "0",
                }),
              }}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {tooltipContent}
    </>
  );
};

export default Tooltip;
