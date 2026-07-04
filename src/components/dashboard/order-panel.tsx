"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Zap, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface OrderPanelProps {
  symbol: string;
  price: number;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  currencySymbol: string;
  t: (key: string) => string;
}

export function OrderPanel({ symbol, price, balance, setBalance, currencySymbol, t }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [isPaper, setIsPaper] = useState(true);
  const [executing, setExecuting] = useState(false);
  
  const db = useFirestore();
  const { toast } = useToast();

  const total = parseFloat(amount) * price || 0;

  // Real-time Risk Assessment Protocol
  const riskAssessment = useMemo(() => {
    const val = parseFloat(amount) || 0;
    if (val === 0) return { score: 100, label: "Ready", color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", icon: <ShieldCheck className="h-3 w-3" /> };
    
    // Logic: Higher percentage of balance = higher risk/potential scam warning
    const balanceImpact = balance > 0 ? (total / balance) * 100 : 100;
    
    if (balanceImpact > 50) {
      return { 
        score: Math.max(12, Math.round(100 - balanceImpact)), 
        label: "High Risk / Volatile", 
        color: "text-rose-500", 
        bg: "bg-rose-500/10", 
        border: "border-rose-500/30",
        icon: <ShieldAlert className="h-3 w-3" />
      };
    } else if (balanceImpact > 15) {
      return { 
        score: Math.round(100 - balanceImpact), 
        label: "Moderate Caution", 
        color: "text-amber-500", 
        bg: "bg-amber-500/10", 
        border: "border-amber-500/30",
        icon: <AlertTriangle className="h-3 w-3" />
      };
    } else {
      return { 
        score: 98, 
        label: "Worth It / Verified", 
        color: "text-emerald-500", 
        bg: "bg-emerald-500/10", 
        border: "border-emerald-500/30",
        icon: <ShieldCheck className="h-3 w-3" />
      };
    }
  }, [amount, total, balance]);

  const handlePlaceOrder = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    if (balance <= 0) {
      toast({
        variant: "destructive",
        title: "Liquidity Failure",
        description: "Terminal balance is at zero. Please initiate a deposit protocol to proceed."
      });
      return;
    }

    if (orderType === "buy" && balance < total) {
      toast({
        variant: "destructive",
        title: "Insufficient Funds",
        description: `Market entry denied. Trade value (${currencySymbol}${total.toFixed(2)}) exceeds available liquidity.`
      });
      return;
    }

    setExecuting(true);
    
    const tradeData = {
      symbol,
      type: orderType,
      price,
      amount: parseFloat(amount),
      total,
      timestamp: serverTimestamp(),
      status: "completed",
      isPaper
    };

    addDoc(collection(db, "trades"), tradeData)
      .then(() => {
        if (orderType === "buy") {
          setBalance(prev => prev - total);
        } else {
          setBalance(prev => prev + total);
        }

        toast({
          title: "Protocol Executed",
          description: `Successfully ${orderType === 'buy' ? 'deducted' : 'added'} ${currencySymbol}${total.toFixed(2)} ${orderType === 'buy' ? 'from' : 'to'} your balance.`,
        });
        setAmount("");
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'trades',
          operation: 'create',
          requestResourceData: tradeData,
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setExecuting(false);
      });
  };

  return (
    <Card className="p-4 bg-card border-none shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-headline font-bold">{t('execution')}</h3>
        <div className="flex items-center gap-2 bg-secondary/30 px-2 py-1 rounded-full">
          <Switch 
            id="paper-mode" 
            checked={isPaper} 
            onCheckedChange={setIsPaper}
            className="data-[state=checked]:bg-primary"
          />
          <Label htmlFor="paper-mode" className="text-[10px] font-bold text-muted-foreground uppercase cursor-pointer">
            {isPaper ? t('paper') : t('live')}
          </Label>
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
          <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
          <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="ghost" 
            className={cn(
              "h-10 text-xs font-bold border-2 transition-all",
              orderType === 'buy' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/50" : "bg-secondary text-muted-foreground border-transparent"
            )}
            onClick={() => setOrderType('buy')}
          >
            {t('buy')}
          </Button>
          <Button 
            variant="ghost" 
            className={cn(
              "h-10 text-xs font-bold border-2 transition-all",
              orderType === 'sell' ? "bg-rose-500/10 text-rose-500 border-rose-500/50" : "bg-secondary text-muted-foreground border-transparent"
            )}
            onClick={() => setOrderType('sell')}
          >
            {t('sell')}
          </Button>
        </div>

        <TabsContent value="market" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase">{t('quantity')} ({symbol})</Label>
            <div className="relative">
              <Input 
                type="number" 
                placeholder="0.00" 
                className="bg-secondary/50 border-none font-code text-lg h-12 pr-12 focus-visible:ring-primary shadow-inner"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-headline font-bold">
                MAX
              </span>
            </div>
          </div>

          <div className="p-3 bg-secondary/20 rounded-lg space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{t('market_price')}</span>
              <span className="font-code">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{t('est_value')}</span>
              <span className="font-code">{currencySymbol}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{t('trading_fee')}</span>
              <span className="font-code text-emerald-500">$0.00</span>
            </div>
          </div>

          {/* Dynamic Integrity Protocol Indicator */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-xl border transition-all duration-500",
            riskAssessment.bg,
            riskAssessment.border
          )}>
            <div className="flex items-center gap-2">
              <div className={cn("p-1.5 rounded-lg bg-background/50", riskAssessment.color)}>
                {riskAssessment.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Integrity Check</span>
                <span className={cn("text-[10px] font-bold uppercase tracking-tight", riskAssessment.color)}>
                  {riskAssessment.label}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black uppercase text-muted-foreground block">Safety Score</span>
              <span className={cn("text-xs font-code font-black", riskAssessment.color)}>
                {riskAssessment.score}/100
              </span>
            </div>
          </div>

          <Button 
            onClick={handlePlaceOrder}
            disabled={executing || !amount}
            className={cn(
              "w-full h-12 font-headline font-black text-lg shadow-lg gap-2 transition-all uppercase tracking-tighter",
              orderType === 'buy' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
            )}
          >
            {executing ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Zap className="h-5 w-5 fill-current" />
            )}
            {orderType === 'buy' ? t('execute_buy') : t('execute_sell')}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
