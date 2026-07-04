
"use client";

import { 
  BookOpen, 
  ShieldAlert, 
  Mail, 
  ChevronRight, 
  ArrowLeft,
  Globe,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Zap,
  Database,
  Rocket,
  Activity,
  Send,
  Loader2,
  CheckCircle2,
  Scale
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SupportHumanIcon } from "@/components/brand/support-human-icon";
import { useToast } from "@/hooks/use-toast";

interface SupportViewProps {
  t: (key: string) => string;
}

const INTERNATIONAL_LAWS = [
  { 
    title: "Anti-Money Laundering (AML)", 
    description: "Prevent illicit fund movements through high-fidelity monitoring.", 
    extendedExplanation: "Bicent Terminal monitors pattern shifts and flags structured execution logs (SARs) to prevent unauthorized capital flight." 
  },
  { 
    title: "Know Your Customer (KYC)", 
    description: "Identity verification protocol for terminal enrollment.", 
    extendedExplanation: "Requires verified Gmail linkage and 4-digit master PIN handshake for all financial node operations." 
  },
  { 
    title: "Insider Trading Laws", 
    description: "Prohibits execution based on Material Non-Public Information.", 
    extendedExplanation: "Active cross-market surveillance nodes monitor for anomalous trading activity preceding major geopolitical shifts." 
  },
  {
    title: "4-Digit Integrity Protocol",
    description: "Standardized security requirement for all liquidity movements.",
    extendedExplanation: "Every withdrawal and deposit requires a 4-digit PIN verification to ensure operator authorization at the execution layer."
  }
];

const TERMINAL_DOCS = [
  {
    title: "1. Core Registries & Search",
    description: "Asset indexing and metadata structures.",
    icon: <Database className="h-5 w-5" />,
    items: [
      { title: "[Symbol Search API]", content: "Trie-based indexing for sub-10ms prefix resolution across Crypto, Stocks, and Commodities." },
      { title: "[Asset Specifications]", content: "Registry definitions for lot sizes, contract multipliers, and live/delayed status markers." }
    ]
  },
  {
    title: "2. Security & Verification",
    description: "Handshake protocols and access control.",
    icon: <ShieldCheck className="h-5 w-5" />,
    items: [
      { title: "[4-Digit Master PIN]", content: "The primary execution barrier. All financial protocols require a verified 4-digit match." },
      { title: "[2FA Dispatch]", content: "Encrypted Gmail dispatch protocol for account recovery and identity verification." }
    ]
  },
  {
    title: "3. Market Feeds",
    description: "Low-latency streaming infrastructure.",
    icon: <Activity className="h-5 w-5" />,
    items: [
      { title: "[WebSocket Protocol]", content: "Sub-second Level 1 and Level 2 feed synchronization for real-time charting." },
      { title: "[Historical OHLCV API]", content: "Time-series extraction for technical analysis snapshots." }
    ]
  },
  {
    title: "4. Execution Logic",
    description: "Deterministic order handling.",
    icon: <Rocket className="h-5 w-5" />,
    items: [
      { title: "[Order State Machine]", content: "Tracks order transitions from Dispatched to Filled or Rejected in the immutable ledger." },
      { title: "[Risk Gateways]", content: "Automated integrity checks based on terminal balance and asset volatility." }
    ]
  }
];

export function SupportView({ t }: SupportViewProps) {
  const [activeMode, setActiveMode] = useState<"main" | "laws" | "tech" | "docs" | "dispatch" | "suggestion">("main");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedDocKey, setExpandedDocKey] = useState<string | null>(null);

  const [suggestionText, setSuggestionText] = useState("");
  const [dispatchText, setDispatchText] = useState("");
  const [targetNode, setTargetNode] = useState("ethankipkorir00@gmail.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleBack = () => {
    setActiveMode("main");
    setExpandedIdx(null);
    setExpandedDocKey(null);
  };

  const handleSendDispatch = () => {
    if (!dispatchText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDispatchText("");
      setActiveMode("main");
      toast({ title: "Intelligence Dispatched", description: `Encrypted message successfully routed to ${targetNode}.` });
    }, 1500);
  };

  const handleSendSuggestion = () => {
    if (!suggestionText.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuggestionText("");
      setActiveMode("main");
      toast({ title: "Protocol Registry Updated", description: "Technical enhancement request logged to terminal registry." });
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-700 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {activeMode !== "main" && (
              <button onClick={handleBack} className="p-2 hover:bg-muted rounded-full group"><ArrowLeft className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" /></button>
            )}
            <h2 className="text-4xl font-headline font-black uppercase tracking-tighter flex items-center gap-3">
              {activeMode === "main" && <SupportHumanIcon className="h-10 w-10 text-primary" />}
              {activeMode === "suggestion" ? "Suggestion Box" : 
               activeMode === "dispatch" ? "Secure Dispatch" : 
               activeMode === "docs" ? "Terminal Docs" : 
               activeMode === "laws" ? "Trading Laws" : 
               activeMode === "tech" ? "Technical Support" : t('support')}
            </h2>
          </div>
        </div>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
          {activeMode === "main" ? "Personal Assistant Liaison Gateway v3.0.8" : "Protocol Operational Interface Active"}
        </p>
      </div>

      {activeMode === "main" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Technical Support", desc: "Direct liaison to matching engine nodes.", icon: <MessageSquare className="h-5 w-5" />, color: "text-primary", mode: "tech" },
            { title: "Trading Laws", desc: "Regional registries and compliance documentation.", icon: <Scale className="h-5 w-5" />, color: "text-rose-500", mode: "laws" },
            { title: "Terminal Docs", desc: "Core logic and execution specifications.", icon: <BookOpen className="h-5 w-5" />, color: "text-emerald-500", mode: "docs" },
            { title: "Secure Dispatch", desc: "Encrypted intelligence routing protocol.", icon: <Mail className="h-5 w-5" />, color: "text-amber-500", mode: "dispatch" }
          ].map((c: any) => (
            <Card key={c.title} onClick={() => setActiveMode(c.mode)} className="p-6 bg-card/40 border-border hover:border-primary/20 transition-all cursor-pointer group shadow-xl backdrop-blur-md">
              <div className="flex gap-5">
                <div className={cn("p-4 rounded-2xl", c.color.replace('text-', 'bg-') + "/10", c.color)}>{c.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-headline font-black uppercase tracking-tight">{c.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeMode === "tech" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
          <Card className="p-8 bg-card/40 border-border hover:border-primary/20 transition-all cursor-pointer shadow-xl backdrop-blur-md flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit"><MessageSquare className="h-6 w-6" /></div>
            <h3 className="text-xl font-headline font-black uppercase tracking-tight">Direct Liaison</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Submit high-priority tickets to terminal operational nodes.</p>
            <Button onClick={() => setActiveMode("dispatch")} className="mt-auto h-10 uppercase text-[10px] font-black tracking-widest bg-primary">Initiate Chat</Button>
          </Card>
          <Card onClick={() => setActiveMode("suggestion")} className="p-8 bg-card/40 border-border hover:border-purple-500/20 transition-all cursor-pointer shadow-xl backdrop-blur-md flex flex-col gap-6">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 w-fit"><Lightbulb className="h-6 w-6" /></div>
            <h3 className="text-xl font-headline font-black uppercase tracking-tight">Suggestion Box</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Submit protocol enhancements to dev nodes.</p>
            <Button className="mt-auto h-10 uppercase text-[10px] font-black tracking-widest bg-purple-500">Log Feedback</Button>
          </Card>
        </div>
      )}

      {activeMode === "laws" && (
        <div className="space-y-4 animate-in fade-in duration-500">
          {INTERNATIONAL_LAWS.map((law, idx) => {
            const isExp = expandedIdx === idx;
            return (
              <Card key={idx} onClick={() => setExpandedIdx(isExp ? null : idx)} className={cn("p-6 bg-card/40 border-border cursor-pointer transition-all border-l-4", isExp ? "border-l-rose-500 bg-card/60" : "border-l-rose-500/30")}>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-headline font-black uppercase tracking-tight">{law.title}</h4>
                    <p className="text-[11px] text-muted-foreground">{law.description}</p>
                  </div>
                  {isExp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                {isExp && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in">
                    <p className="text-xs text-foreground/80 leading-relaxed italic">{law.extendedExplanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {activeMode === "suggestion" && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 bg-card border-border shadow-2xl rounded-[2rem] border-purple-500/10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol Enhancement Request</label>
                <div className="relative">
                  <Textarea 
                    placeholder="Detail your technical enhancement request here..." 
                    className="min-h-[300px] bg-secondary/30 border-none rounded-2xl p-6 text-sm font-body leading-relaxed focus-visible:ring-purple-500 shadow-inner"
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-6 text-[9px] font-black uppercase text-muted-foreground/40">Sync Status: Active</div>
                </div>
              </div>
              <Button onClick={handleSendSuggestion} disabled={isSubmitting || !suggestionText.trim()} className="w-full h-14 bg-purple-500 hover:bg-purple-600 font-headline font-black text-lg uppercase shadow-lg shadow-purple-500/20">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />} Dispatch Suggestion
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeMode === "dispatch" && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 bg-card border-border shadow-2xl rounded-[2rem] border-amber-500/10">
            <div className="space-y-6">
              <Textarea 
                placeholder="Encrypted intelligence content..." 
                className="min-h-[250px] bg-secondary/30 border-none rounded-2xl p-6 text-sm focus-visible:ring-amber-500 shadow-inner"
                value={dispatchText}
                onChange={(e) => setDispatchText(e.target.value)}
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Intelligence Node</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { email: "ethankipkorir00@gmail.com", label: "Operations Liaison" },
                    { email: "topillajayden5@gmail.com", label: "Security Clearing" }
                  ].map(n => (
                    <button key={n.email} onClick={() => setTargetNode(n.email)} className={cn("p-5 rounded-2xl border transition-all text-left flex justify-between items-center", targetNode === n.email ? "bg-amber-500/10 border-amber-500" : "bg-secondary/20 border-white/5")}>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block uppercase tracking-tight">{n.label}</span>
                        <span className="text-[10px] font-code text-muted-foreground lowercase">{n.email}</span>
                      </div>
                      {targetNode === n.email && <CheckCircle2 className="h-4 w-4 text-amber-500" />}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSendDispatch} disabled={isSubmitting || !dispatchText.trim()} className="w-full h-14 bg-amber-500 hover:bg-amber-600 font-headline font-black text-lg uppercase">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />} Initiate Dispatch
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeMode === "docs" && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          {TERMINAL_DOCS.map((s, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">{s.icon}</div>
                <h3 className="text-xl font-headline font-black uppercase tracking-tight">{s.title}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {s.items.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  const isExp = expandedDocKey === key;
                  return (
                    <Card key={iIdx} onClick={() => setExpandedDocKey(isExp ? null : key)} className={cn("p-5 bg-card/40 cursor-pointer border-l-4 transition-all hover:bg-card/60", isExp ? "border-l-emerald-500 ring-1 ring-emerald-500/20" : "border-l-emerald-500/30")}>
                      <div className="flex justify-between items-center">
                        <span className={cn("text-sm font-bold uppercase", isExp ? "text-emerald-500" : "text-foreground")}>{item.title}</span>
                        {isExp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                      {isExp && <div className="mt-4 pt-4 border-t border-white/5 text-xs text-muted-foreground leading-relaxed animate-in fade-in">{item.content}</div>}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-[9px] text-muted-foreground uppercase tracking-[0.3em] mt-auto pt-8">
        BICENT TERMINAL • SECURE SUPPORT LIAISON • V3.0.8
      </p>
    </div>
  );
}
