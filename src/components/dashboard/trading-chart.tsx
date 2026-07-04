
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bar, 
  ComposedChart,
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Label
} from "recharts";
import { generateChartData } from "@/app/lib/mock-data";
import { cn } from "@/lib/utils";
import { Activity, Zap } from "lucide-react";

interface TradingChartProps {
  symbol: string;
  basePrice: number;
}

const Candlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || height === undefined) return null;
  
  const { open, close } = payload;
  const isBullish = close >= open;
  const color = isBullish ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";

  return (
    <g>
      {/* Top Wick - Short line to the top of the candle */}
      <line
        x1={x + width / 2}
        y1={y - 8}
        x2={x + width / 2}
        y2={y}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(Math.abs(height), 2)}
        fill={color}
        className="transition-all duration-300"
      />
      {/* Bottom Wick - Short line to the bottom of the candle */}
      <line
        x1={x + width / 2}
        y1={y + height}
        x2={x + width / 2}
        y2={y + height + 8}
        stroke={color}
        strokeWidth={1.5}
      />
    </g>
  );
};

export function TradingChart({ symbol, basePrice }: TradingChartProps) {
  const [timeframe, setTimeframe] = useState("5m");
  const [data, setData] = useState<any[]>([]);
  const [tickerPrice, setTickerPrice] = useState(basePrice);
  
  const [sellOffset, setSellOffset] = useState(0.0005);
  const [buyOffset, setBuyOffset] = useState(0.0005);
  const [activeLine, setActiveLine] = useState<'sell' | 'buy'>('sell');
  
  const tickCounterRef = useRef<number>(0);

  const TIMEFRAME_MAP: Record<string, number> = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1h': 3600,
    '1d': 86400
  };

  useEffect(() => {
    const intervalMinutes = timeframe.includes('m') ? parseInt(timeframe) : timeframe.includes('h') ? parseInt(timeframe) * 60 : 1440;
    const initialData = generateChartData(basePrice, 50).map((d, i, arr) => {
       const now = new Date();
       const offset = (arr.length - 1 - i) * intervalMinutes * 60 * 1000;
       return { ...d, time: new Date(now.getTime() - offset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    });
    setData(initialData);
    setTickerPrice(initialData[initialData.length - 1].close);
    tickCounterRef.current = 0;
  }, [symbol, basePrice, timeframe]);

  useEffect(() => {
    const threshold = TIMEFRAME_MAP[timeframe] || 300;

    const tickInterval = setInterval(() => {
      setTickerPrice(prev => {
        const midVolatility = prev * 0.0004; 
        const midMove = (Math.random() - 0.5) * midVolatility;
        const newMid = prev + midMove;
        
        setSellOffset(s => Math.max(0.0002, Math.min(0.0015, s + (Math.random() - 0.5) * 0.0001)));
        setBuyOffset(b => Math.max(0.0002, Math.min(0.0015, b + (Math.random() - 0.5) * 0.0001)));

        setData(currentData => {
          if (currentData.length === 0) return currentData;
          const updated = [...currentData];
          const lastIdx = updated.length - 1;
          const last = { ...updated[lastIdx] };
          
          const activePrice = activeLine === 'sell' ? (newMid * (1 + sellOffset)) : (newMid * (1 - buyOffset));
          
          last.close = activePrice;
          last.high = Math.max(last.high, activePrice);
          last.low = Math.min(last.low, activePrice);
          last.body = [last.open, activePrice];
          
          updated[lastIdx] = last;
          return updated;
        });
        return newMid;
      });

      tickCounterRef.current += 1;
      
      if (tickCounterRef.current >= threshold) {
        tickCounterRef.current = 0;
        setActiveLine(prev => prev === 'sell' ? 'buy' : 'sell');
        setData(prev => {
          const lastCandle = prev[prev.length - 1];
          return [...prev.slice(1), {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: lastCandle.close,
            high: lastCandle.close,
            low: lastCandle.close,
            close: lastCandle.close,
            body: [lastCandle.close, lastCandle.close]
          }];
        });
      }
    }, 1000); 
    
    return () => clearInterval(tickInterval);
  }, [activeLine, sellOffset, buyOffset, timeframe]);

  const yDomain = useMemo(() => {
    if (data.length === 0) return ['auto', 'auto'];
    const mins = data.map(d => d.low);
    const maxs = data.map(d => d.high);
    const min = Math.min(...mins, tickerPrice * 0.99);
    const max = Math.max(...maxs, tickerPrice * 1.01);
    return [min * 0.999, max * 1.001];
  }, [data, tickerPrice]);

  const currentAsk = tickerPrice * (1 + sellOffset);
  const currentBid = tickerPrice * (1 - buyOffset);
  const activePrice = activeLine === 'sell' ? currentAsk : currentBid;

  return (
    <Card className="p-8 bg-card border-none shadow-2xl flex flex-col h-full overflow-hidden max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-headline text-3xl font-black uppercase tracking-tighter">
              {symbol}
            </h2>
            <span className="text-[10px] font-black uppercase text-muted-foreground/40 mt-2 tracking-widest">Global Index</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">Live Execution</span>
              <span className={cn(
                "font-code text-3xl font-black transition-colors duration-500",
                activeLine === 'sell' ? "text-rose-500" : "text-emerald-500"
              )}>
                ${activePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center gap-3 bg-secondary/20 px-4 py-2 rounded-2xl border border-border/50">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-2.5 w-2.5 rounded-full animate-pulse transition-all duration-500", 
                  activeLine === 'sell' ? "bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                )} />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                  {activeLine === 'sell' ? 'ASK' : 'BID'} Lead
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={timeframe} onValueChange={setTimeframe} className="bg-secondary/30 p-1 rounded-xl">
          <TabsList className="h-8 bg-transparent">
            {['1m', '5m', '15m', '1h', '1d'].map(tf => (
              <TabsTrigger key={tf} value={tf} className="data-[state=active]:bg-card text-[10px] font-black uppercase h-6 px-3 rounded-lg transition-all">
                {tf}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 80, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="time" 
              hide={false} 
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              domain={yDomain} 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              fontFamily="var(--font-code)" 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(10, 12, 16, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '11px', fontFamily: 'var(--font-code)' }}
              cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
            />
            
            <ReferenceLine 
              y={currentAsk} 
              stroke="hsl(0, 84%, 60%)" 
              strokeDasharray="6 4" 
              strokeWidth={activeLine === 'sell' ? 2 : 1}
              className={cn("transition-all duration-700", activeLine === 'sell' ? "opacity-100" : "opacity-30")}
            >
              <Label 
                value={`ASK: $${currentAsk.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
                position="right" 
                fill="hsl(0, 84%, 60%)" 
                style={{ fontSize: '9px', fontWeight: '900' }} 
              />
            </ReferenceLine>
            
            <ReferenceLine 
              y={currentBid} 
              stroke="hsl(142, 71%, 45%)" 
              strokeDasharray="2 4" 
              strokeWidth={activeLine === 'buy' ? 2 : 1}
              className={cn("transition-all duration-700", activeLine === 'buy' ? "opacity-100" : "opacity-30")}
            >
              <Label 
                value={`BID: $${currentBid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
                position="right" 
                fill="hsl(142, 71%, 45%)" 
                style={{ fontSize: '9px', fontWeight: '900' }} 
              />
            </ReferenceLine>

            <Bar dataKey="body" shape={<Candlestick />} isAnimationActive={false}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
