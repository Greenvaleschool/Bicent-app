"use client";

import { BullLogo } from "@/components/brand/bull-logo";

export function TerminalSplash() {
  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative group">
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all animate-pulse" />
        <BullLogo className="h-32 w-32 text-primary relative z-10 animate-pulse" />
      </div>
      <div className="mt-12 flex flex-col items-center space-y-4">
        <h1 className="font-headline font-black text-4xl tracking-tighter uppercase animate-pulse">
          BICENT
        </h1>
        <div className="flex gap-1">
          <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}
