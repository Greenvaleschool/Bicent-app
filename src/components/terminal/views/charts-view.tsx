
"use client";

import { TradingChart } from "@/components/dashboard/trading-chart";
import { Asset } from "@/app/lib/mock-data";
import { Zap, TrendingUp, TrendingDown, Cpu, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface ChartsViewProps {
  selectedAsset: Asset;
  t: (key: string) => string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  currencySymbol: string;
}

export function ChartsView({ 
  selectedAsset, t, balance, setBalance, currencySymbol
}: ChartsViewProps) {
  const [executing, setExecuting] = useState(false);
  const [tradeAmount, setTradeAmount] = useState("0.01");
  const db = useFirestore();
  const { toast } = useToast();

  const handleQuickTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(tradeAmount) || 0;
    if (amount <= 0) return;
    const total = amount * selectedAsset.price;

    if (type === 'buy' && balance < total) {
      toast({ variant: "destructive", title: "Insufficient Funds" });
      return;
    }

    setExecuting(true);
    const tradeData = {
      symbol: selectedAsset.symbol,
      type,
      price: selectedAsset.price,
      amount,
      total,
      timestamp: serverTimestamp(),
      status: "completed",
      isPaper: true
    };

    addDoc(collection(db, "trades"), tradeData)
      .then(() => {
        setBalance(prev => type === "buy" ? prev - total : prev + total);
        toast({ title: "Quick Execution Success" });
      })
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'trades', operation: 'create', requestResourceData: tradeData }));
      })
      .finally(() => setExecuting(false));
  };

  return (
    <div className="flex-1 flex flex-col gap-6 h-full animate-in fade-in duration-700 max-w-5xl mx-auto w-full items-center">
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <TradingChart symbol={selectedAsset.symbol} basePrice={selectedAsset.price} />
      </div>

      <Card className="p-6 bg-card/40 backdrop-blur-md border border-border rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution Quantity</Label>
            <div className="relative">
              <Input type="number" step="0.01" className="bg-secondary/20 border-none h-12 text-lg font-code rounded-2xl" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/40 uppercase">{selectedAsset.symbol}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 h-fit mt-auto">
            <Button onClick={() => handleQuickTrade('buy')} disabled={executing} className="h-12 bg-emerald-500 hover:bg-emerald-600 font-headline font-black text-lg gap-2 shadow-lg shadow-emerald-500/20 uppercase tracking-tighter"><TrendingUp className="h-5 w-5" /> Buy</Button>
            <Button onClick={() => handleQuickTrade('sell')} disabled={executing} className="h-12 bg-rose-500 hover:bg-rose-600 font-headline font-black text-lg gap-2 shadow-lg shadow-rose-500/20 uppercase tracking-tighter"><TrendingDown className="h-5 w-5" /> Sell</Button>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Protocol Integrity Active</span></div>
          <div className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase"><ShieldCheck className="h-3 w-3 text-primary/50" /> Verified Dispatch Node</div>
        </div>
      </Card>
    </div>
  );
}
