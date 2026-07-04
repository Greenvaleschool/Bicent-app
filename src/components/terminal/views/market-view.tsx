
"use client";

import { useState } from "react";
import { MarketList } from "@/components/dashboard/market-list";
import { ShieldAlert, Newspaper, Zap, Bomb, Activity, ChevronDown, ChevronUp, TrendingUp, BarChart3, Globe } from "lucide-react";
import { Asset } from "@/app/lib/mock-data";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MarketViewProps {
  selectedAsset: Asset;
  setSelectedAsset: (asset: Asset) => void;
  t: (key: string) => string;
}

interface NewsItem {
  id: string;
  category: 'URGENT' | 'GEOPOLITICAL' | 'ECONOMY' | 'CONFLICT' | 'ASSET_INTEL';
  title: string;
  source: string;
  time: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  relatedSymbol?: string;
}

const WORLD_NEWS: NewsItem[] = [
  {
    id: 'btc-1',
    category: 'ASSET_INTEL',
    title: 'BTC: Network Difficulty Reaches All-Time High Amid Institutional Accumulation',
    source: 'Chain-Watch',
    time: '2m ago',
    impact: 'HIGH',
    relatedSymbol: 'BTC',
    description: 'Bitcoin network difficulty has surged to a record 83.9T, indicating a significant increase in hash rate and network security. On-chain data reveals that institutional "whales" have moved over 12,000 BTC into cold storage in the last 48 hours, signaling a strong accumulation phase. Market analysts suggest this supply-side pressure, combined with the upcoming halving cycle, creates a high-conviction bullish divergence despite short-term price fluctuations.'
  },
  {
    id: 'nvda-1',
    category: 'ASSET_INTEL',
    title: 'NVDA: Next-Gen AI Chip Production Targets Revised Upward',
    source: 'Tech-Nexus',
    time: '8m ago',
    impact: 'HIGH',
    relatedSymbol: 'NVDA',
    description: 'NVIDIA has reportedly increased its quarterly production targets for the H200 AI GPUs by 15% to meet overwhelming demand from sovereign cloud initiatives. Supply chain intelligence suggests a breakthrough in HBM3e memory yields has cleared a major bottleneck. This development strengthens NVIDIA\'s dominance in the AI hardware sector, though geopolitical export restrictions to specific regions remain a key risk factor for long-term revenue projections.'
  },
  {
    id: '1',
    category: 'CONFLICT',
    title: 'Strategic Buffer Zone Breach Reported in Eastern Sector',
    source: 'Intel-Sentinel',
    time: '14m ago',
    impact: 'HIGH',
    description: 'Satellite reconnaissance has confirmed a significant breach of the established demilitarized buffer zone in the Eastern Sector. Advanced tactical units have reportedly crossed the 38th parallel equivalent, utilizing low-altitude stealth drones to disable early warning systems. Local defense forces are currently in a state of high alert, and initial skirmishes have been reported near the strategic bridgehead. This escalation marks the most severe violation of the peace treaty in over a decade, directly threatening regional energy pipelines and causing immediate volatility in energy-related financial instruments.'
  },
  {
    id: 'tsla-1',
    category: 'ASSET_INTEL',
    title: 'TSLA: Gigafactory Expansion Halted by Regional Energy Crisis',
    source: 'Eco-Flow',
    time: '22m ago',
    impact: 'MEDIUM',
    relatedSymbol: 'TSLA',
    description: 'Tesla\'s expansion plans for the Berlin Gigafactory have encountered a significant hurdle as local authorities impose emergency energy rationing. The power utility cited a breakdown in natural gas imports from the Eastern Sector as the primary cause. Tesla has initiated a pivot to on-site solar and battery storage systems (Megapacks) to mitigate the impact, but analysts expect a 3-5% delay in Model Y production volumes for the current quarter.'
  },
  {
    id: '2',
    category: 'GEOPOLITICAL',
    title: 'Maritime Blockade Tightens in Southern Straits',
    source: 'GlobalNav',
    time: '35m ago',
    impact: 'HIGH',
    description: 'The Southern Straits blockade has entered its second phase, with naval task forces deploying advanced sea-mine arrays and active sonar jamming. Over 40% of the world’s liquid natural gas transit is now stalled, leading to a massive backlog of tankers. Diplomatic cables suggest that negotiations have reached a stalemate as the occupying force demands total control over transit tariffs. Markets are bracing for a severe supply shock if the blockade persists beyond the 72-hour mark, with insurance premiums for maritime shipping reaching record highs.'
  },
  {
    id: 'eth-1',
    category: 'ASSET_INTEL',
    title: 'ETH: Layer-2 Adoption Spikes as Mainnet Gas Fees Stabilize',
    source: 'Vital-Intel',
    time: '45m ago',
    impact: 'MEDIUM',
    relatedSymbol: 'ETH',
    description: 'Ethereum\'s ecosystem is witnessing a record surge in Layer-2 (L2) transactions, surpassing mainnet volume by 5x. The recent implementation of EIP-4844 blobs has successfully reduced L2 settlement costs, attracting decentralized finance (DeFi) protocols to migrate high-frequency operations. This shift is expected to enhance Ethereum\'s utility as a settlement layer, though it poses challenges for mainnet revenue generation through fees in the short term.'
  },
  {
    id: 'aapl-1',
    category: 'ASSET_INTEL',
    title: 'AAPL: Stealth AI Integration Roadmap Leaked via Supply Chain',
    source: 'Cupertino-Core',
    time: '1h ago',
    impact: 'MEDIUM',
    relatedSymbol: 'AAPL',
    description: 'Reports from component suppliers in the Asia-Pacific region suggest Apple has secured exclusive capacity for 3nm neural engine processors. This move indicates a major push for on-device Generative AI features in the next-generation iPhone lineup. Analysts believe this "Private Cloud Compute" approach could redefine consumer privacy standards in AI, potentially triggering a significant upgrade cycle among the established 2.2 billion active device user base.'
  },
  {
    id: '3',
    category: 'URGENT',
    title: 'Energy Infrastructure Cyber-Attack Mitigated',
    source: 'NetSec',
    time: '1h 15m ago',
    impact: 'MEDIUM',
    description: 'A sophisticated multi-vector cyber-attack targeting the regional electrical grid’s load-balancing system was successfully intercepted. The attackers utilized a previously unknown zero-day exploit targeting outdated firmware in substation controllers. While no physical damage was sustained, the attempt caused localized power fluctuations for approximately 15 minutes. Forensic analysis points to a state-sponsored actor specializing in industrial control systems. Grid operators have initiated a mandatory firmware audit across all critical nodes to prevent a secondary, more potent strike.'
  },
  {
    id: 'gold-1',
    category: 'ECONOMY',
    title: 'GOLD: Central Bank Buying Reaches 50-Year High',
    source: 'Bullion-Brief',
    time: '2h ago',
    impact: 'HIGH',
    relatedSymbol: 'GOLD',
    description: 'The World Gold Council reports that global central banks added a net 1,136 tons of gold to their reserves in the last fiscal year. This marks the highest level of official sector buying since 1967. The move is widely interpreted as a "de-dollarization" hedge amidst rising geopolitical tensions and inflationary pressures. Gold spot prices are showing strong support above the $2,100 psychological level as retail demand in emerging markets remains resilient.'
  }
];

export function MarketView({ selectedAsset, setSelectedAsset, t }: MarketViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 flex gap-4 h-full animate-in fade-in duration-700">
      {/* Sidebar: Market List */}
      <div className="w-80 shrink-0 bg-card/40 backdrop-blur-md rounded-xl border border-border p-4 shadow-xl">
        <MarketList onSelect={setSelectedAsset} selectedSymbol={selectedAsset.symbol} />
      </div>

      {/* Main Panel: World Intel & News Feed */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-card/10 rounded-xl border border-border p-6 shadow-inner">
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xl uppercase tracking-tighter text-foreground">
                {t('global_intelligence')}
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                {t('conflict_stream')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                {t('live_feed')}
              </span>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {WORLD_NEWS.map((news) => (
              <Card 
                key={news.id} 
                onClick={() => toggleExpand(news.id)}
                className={cn(
                  "p-5 bg-card/30 border-border hover:border-primary/30 transition-all cursor-pointer group shadow-lg rounded-2xl border-l-4",
                  expandedId === news.id ? "bg-card/60 border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "hover:bg-card/40",
                  news.impact === 'HIGH' ? "border-l-rose-500" : 
                  news.impact === 'MEDIUM' ? "border-l-amber-500" : "border-l-primary"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border",
                      news.category === 'CONFLICT' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      news.category === 'URGENT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      news.category === 'ASSET_INTEL' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {news.category.replace('_', ' ')}
                    </span>
                    {news.relatedSymbol && (
                      <span className="text-[9px] font-code font-black text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                        {news.relatedSymbol}
                      </span>
                    )}
                    <span className="text-[9px] font-code font-bold text-muted-foreground">{news.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      news.impact === 'HIGH' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" :
                      news.impact === 'MEDIUM' ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                    {expandedId === news.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="shrink-0 p-3 bg-secondary/30 rounded-xl border border-white/5 flex items-center justify-center h-12 w-12">
                    {news.category === 'CONFLICT' ? (
                      <Bomb className="h-5 w-5 text-rose-400" />
                    ) : news.category === 'ASSET_INTEL' ? (
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ) : news.category === 'URGENT' ? (
                      <ShieldAlert className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Globe className="h-5 w-5 text-primary/70" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-headline font-black leading-snug group-hover:text-primary transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Source Node: <span className="text-foreground/60">{news.source}</span>
                    </p>
                    
                    {expandedId === news.id && (
                      <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-foreground/80 leading-relaxed font-body">
                          {news.description}
                        </p>
                        {news.relatedSymbol && (
                          <div className="mt-4 flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/10">
                            <Zap className="h-3 w-3 text-primary" />
                            <span className="text-[9px] text-primary font-black uppercase tracking-widest">
                              Direct market correlation for {news.relatedSymbol} detected.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <footer className="mt-2 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-4">
          <Zap className="h-5 w-5 text-rose-500 fill-current animate-pulse" />
          <div className="flex flex-col">
            <p className="text-[10px] text-rose-500 font-black uppercase tracking-[0.1em] leading-tight">
              Real-time conflict & asset intelligence synchronized. 
            </p>
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
              Monitoring global liquidity markers for {selectedAsset.symbol} and major indices...
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
