
"use client";

import { OrderPanel } from "@/components/dashboard/order-panel";
import { Asset } from "@/app/lib/mock-data";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TradeViewProps {
  selectedAsset: Asset;
  trades: any[];
  deleteTrade: (id: string) => void;
  t: (key: string) => string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  currencySymbol: string;
}

export function TradeView({ selectedAsset, trades, deleteTrade, t, balance, setBalance, currencySymbol }: TradeViewProps) {
  return (
    <div className="flex-1 flex gap-4 min-w-0">
      <div className="w-[450px] shrink-0 overflow-y-auto custom-scrollbar flex flex-col gap-4">
        <OrderPanel 
          symbol={selectedAsset.symbol} 
          price={selectedAsset.price} 
          balance={balance} 
          setBalance={setBalance} 
          currencySymbol={currencySymbol}
          t={t}
        />
      </div>
      <div className="flex-1 bg-card rounded-xl border border-border p-6 overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-headline font-bold text-lg">{t('execution_ledger')}</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">{t('immutable_logs')}</p>
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {trades.length === 0 ? (
            <div className="text-muted-foreground text-xs flex flex-col items-center justify-center h-full border border-dashed border-border rounded-lg gap-4 p-12 text-center">
              <p className="font-headline font-bold text-sm text-foreground">{t('no_recent_executions') || 'No recent executions'}</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border">
                  <th className="pb-4 font-bold uppercase text-[10px]">Symbol</th>
                  <th className="pb-4 font-bold uppercase text-[10px]">Type</th>
                  <th className="pb-4 font-bold uppercase text-[10px]">Price</th>
                  <th className="pb-4 font-bold uppercase text-[10px] text-right">Value</th>
                  <th className="pb-4 font-bold uppercase text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-4 font-bold text-sm">{trade.symbol}</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-sm font-black uppercase text-[10px]",
                        trade.type === 'buy' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-4 font-code">${trade.price?.toLocaleString()}</td>
                    <td className="py-4 text-right font-code">{currencySymbol}{trade.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteTrade(trade.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
