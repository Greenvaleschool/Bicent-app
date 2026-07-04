
"use client";

import { useEffect, useState } from "react";
import { Asset, INITIAL_ASSETS } from "@/app/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, Loader2, RefreshCw, Filter, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MarketListProps {
  onSelect: (asset: Asset) => void;
  selectedSymbol?: string;
  loading?: boolean;
}

type AssetFilter = 'all' | 'crypto' | 'stock' | 'commodity';

export function MarketList({ onSelect, selectedSymbol, loading }: MarketListProps) {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AssetFilter>('all');
  const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    // High-frequency simulation cycle: 1000ms
    const interval = setInterval(() => {
      const flashes: Record<string, 'up' | 'down'> = {};
      
      setAssets((prev) =>
        prev.map((asset) => {
          // Commodities and Crypto have higher "live" volatility simulation
          const volatilityScale = asset.type === 'stock' ? 0.0005 : 0.0015;
          const move = (Math.random() - 0.5) * (asset.price * volatilityScale);
          const newPrice = asset.price + move;
          
          if (Math.abs(move) > asset.price * (volatilityScale * 0.2)) {
            flashes[asset.symbol] = move > 0 ? 'up' : 'down';
          }

          return {
            ...asset,
            price: newPrice,
            change: asset.change + move,
            changePercent: ((asset.change + move) / (newPrice - (asset.change + move))) * 100,
          };
        })
      );

      if (Object.keys(flashes).length > 0) {
        setPriceFlash(f => ({ ...f, ...flashes }));
        setTimeout(() => {
          setPriceFlash(f => {
            const next = { ...f };
            Object.keys(flashes).forEach(key => {
              next[key] = null;
            });
            return next;
          });
        }, 400);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
                          asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || asset.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            className="pl-9 bg-secondary/50 border-none h-9 focus-visible:ring-primary text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 bg-secondary/50 rounded-md">
              <Filter className={cn("h-4 w-4", filter !== 'all' ? "text-primary" : "text-muted-foreground")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={() => setFilter('all')} className={cn("text-xs font-bold uppercase", filter === 'all' && "text-primary")}>All Assets</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('crypto')} className={cn("text-xs font-bold uppercase", filter === 'crypto' && "text-primary")}>Crypto</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('stock')} className={cn("text-xs font-bold uppercase", filter === 'stock' && "text-primary")}>Stocks</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('commodity')} className={cn("text-xs font-bold uppercase", filter === 'commodity' && "text-primary")}>Commodities</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-auto space-y-1 pr-1 custom-scrollbar relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 rounded-xl animate-in fade-in duration-300">
            <div className="relative">
              <RefreshCw className="h-8 w-8 text-primary animate-spin opacity-20" />
              <Loader2 className="absolute inset-0 h-8 w-8 text-primary animate-spin" />
            </div>
            <span className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-primary animate-pulse">Syncing...</span>
          </div>
        )}
        
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-[10px] uppercase font-bold font-headline">No assets matching protocol</div>
        ) : (
          filteredAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => onSelect(asset)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all border border-transparent hover:bg-secondary/80 group",
                selectedSymbol === asset.symbol ? "bg-secondary border-primary/20" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm group-hover:text-primary transition-colors">
                    {asset.symbol}
                  </span>
                  {asset.status === 'live' && (
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">Live</span>
                    </div>
                  )}
                </div>
                <span className={cn(
                  "font-code text-[13px] transition-colors duration-500 rounded px-1",
                  priceFlash[asset.symbol] === 'up' ? "text-emerald-400 bg-emerald-400/10" : 
                  priceFlash[asset.symbol] === 'down' ? "text-rose-400 bg-rose-400/10" : ""
                )}>
                  {asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span className="truncate max-w-[120px]">{asset.name}</span>
                <div className={cn(
                  "flex items-center gap-1 font-medium",
                  asset.change >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {asset.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {asset.changePercent.toFixed(2)}%
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
