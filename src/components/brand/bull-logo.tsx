
"use client";

import { cn } from "@/lib/utils";

/**
 * BullLogo: A full square silhouette composed of distinct hollow sub-rectangles.
 * Represents structural complexity, modular intelligence, and balanced data processing.
 */
export function BullLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-12 h-12", className)}
    >
      <g stroke="currentColor" strokeWidth="4">
        {/* Top-Left: Major processing core */}
        <rect x="5" y="5" width="60" height="60" rx="2" />
        
        {/* Top-Right: High-frequency tactical unit */}
        <rect x="70" y="5" width="25" height="25" rx="2" />
        
        {/* Bottom-Right: Long-term data ledger */}
        <rect x="70" y="35" width="25" height="60" rx="2" />
        
        {/* Bottom-Left: Execution interface layer */}
        <rect x="5" y="70" width="60" height="25" rx="2" />
      </g>
    </svg>
  );
}
