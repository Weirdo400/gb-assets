"use client";

const DELAYS = [0, -1.4285714286, -2.8571428571, -4.2857142857, -5.7142857143, -7.1428571429, -8.5714285714];

export default function LoadingScreen({ message = "Please wait…" }: { message?: string }) {
  return (
    <>
      <style>{`
        @keyframes gb-square {
          0%    { left: 0;    top: 0;   }
          10.5% { left: 0;    top: 0;   }
          12.5% { left: 32px; top: 0;   }
          23%   { left: 32px; top: 0;   }
          25%   { left: 64px; top: 0;   }
          35.5% { left: 64px; top: 0;   }
          37.5% { left: 64px; top: 32px;}
          48%   { left: 64px; top: 32px;}
          50%   { left: 32px; top: 32px;}
          60.5% { left: 32px; top: 32px;}
          62.5% { left: 32px; top: 64px;}
          73%   { left: 32px; top: 64px;}
          75%   { left: 0;    top: 64px;}
          85.5% { left: 0;    top: 64px;}
          87.5% { left: 0;    top: 32px;}
          98%   { left: 0;    top: 32px;}
          100%  { left: 0;    top: 0;   }
        }
      `}</style>

      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-10"
        style={{ background: "var(--background)", color: "var(--foreground)", zIndex: 9999 }}
      >
        {/* Wordmark */}
        <div
          className="font-bold uppercase text-center select-none"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.04em", lineHeight: 0.9 }}
        >
          Global<br />Assets
        </div>

        {/* Animated squares */}
        <div style={{ position: "relative", width: 96, height: 96, transform: "rotate(45deg)" }}>
          {DELAYS.map((delay, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: 28, height: 28,
                margin: 2,
                background: "var(--foreground)",
                animation: `gb-square 10s ease-in-out ${delay}s infinite both`,
              }}
            />
          ))}
        </div>

        {/* Message */}
        <p className="metric-label">{message}</p>
      </div>
    </>
  );
}
