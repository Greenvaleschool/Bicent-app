
"use client";

import { cn } from "@/lib/utils";

export function NavItem({ icon, label, active = false, isSidebarOpen = true, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  isSidebarOpen: boolean,
  onClick?: () => void
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group border border-transparent outline-none",
        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        !isSidebarOpen && "justify-center px-0"
      )}
    >
      <div className={cn("shrink-0 transition-transform group-hover:scale-110", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")}>
        {icon}
      </div>
      {isSidebarOpen && <span className="font-headline font-bold text-sm tracking-wide">{label}</span>}
    </button>
  );
}
