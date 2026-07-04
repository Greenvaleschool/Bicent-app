
"use client";

import { cn } from "@/lib/utils";

/**
 * SupportHumanIcon: A minimalist illustration of a human figure wearing a professional headset.
 * Designed with simple, clean lines and a warm smile to represent 
 * professional support and human-centric liaison services.
 * Updated: Headset band connector refined to be thinner.
 */
export function SupportHumanIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-12 h-12", className)}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shoulders / Body base */}
      <path d="M4 20c0-2.5 2-4.5 5-5h6c3 0 5 2.5 5 5" />
      
      {/* Head */}
      <circle cx="12" cy="9" r="4.5" />
      
      {/* Warm Smile */}
      <path d="M10.5 10.5c.5.8 2.5.8 3 0" strokeWidth="1" />
      
      {/* Eyes */}
      <circle cx="10.5" cy="8.5" r="0.5" fill="currentColor" />
      <circle cx="13.5" cy="8.5" r="0.5" fill="currentColor" />
      
      {/* Headset Band - connected to the 2 ends above the head - refined thickness */}
      <path d="M6.25 7a5.75 5.75 0 0 1 11.5 0" strokeWidth="1.2" />
      
      {/* Hollow Earpieces */}
      <rect x="16.5" y="7" width="2.5" height="6" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5" y="7" width="2.5" height="6" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
      
      {/* Prominent Microphone Boom arm */}
      <path d="M17 11.5c0 2.5-2 4-4 4" strokeWidth="1.2" />
      {/* Microphone tip */}
      <circle cx="13" cy="15.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
