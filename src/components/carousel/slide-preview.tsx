"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Design width the slide typography is authored against (LinkedIn portrait). */
const BASE_W = 1080;
const BASE_H = 1350;

/**
 * Renders a carousel slide at export proportions, scaled to the container width.
 * Fixes “content too big” in template pickers without changing export output.
 */
export function SlidePreview({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / BASE_W);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative aspect-[4/5] w-full overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute top-0 left-0 origin-top-left"
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
        }}
      >
        <div className="h-full w-full [&_>div]:h-full [&_>div]:rounded-none [&_>div]:border-0 [&_>div]:shadow-none">
          {children}
        </div>
      </div>
    </div>
  );
}
