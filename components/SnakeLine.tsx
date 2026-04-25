"use client";
import { useEffect, useRef } from "react";

export default function SnakeLine({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let raf: number;

    const setup = () => {
      const svg = svgRef.current;
      const path = pathRef.current;
      if (!svg || !path) return;

      const { width: w, height: h } = svg.getBoundingClientRect();
      if (!w || !h) { raf = requestAnimationFrame(setup); return; }

      const ROWS = Math.max(8, Math.floor(h / 58));
      const rowH = h / ROWS;
      const r = rowH / 2;
      const segs: string[] = [];

      for (let i = 0; i < ROWS; i++) {
        const y = rowH * i + r;
        const ltr = i % 2 === 0;
        if (i === 0) segs.push(`M ${ltr ? 0 : w},${y}`);
        segs.push(`L ${ltr ? w : 0},${y}`);
        if (i < ROWS - 1) {
          const ny = y + rowH;
          segs.push(ltr
            ? `A ${r},${r} 0 0 1 ${w},${ny}`
            : `A ${r},${r} 0 0 0 0,${ny}`
          );
        }
      }

      path.setAttribute("d", segs.join(" "));
      const len = path.getTotalLength();
      const body = len * 0.04;

      path.style.strokeDasharray = `${body} ${len}`;
      path.animate(
        [{ strokeDashoffset: 0 }, { strokeDashoffset: -(len + body) }] as Keyframe[],
        { duration: (len / 280) * 1000, iterations: Infinity, easing: "linear" }
      );
    };

    raf = requestAnimationFrame(setup);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className ?? ""}`}
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.12"
      />
    </svg>
  );
}
