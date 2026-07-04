
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Database, User, Mail, Sparkles, Phone, Target, Languages } from "lucide-react";
import { extractData } from "@/ai/flows/data-extraction-flow";
import { useToast } from "@/hooks/use-toast";

export function ExtractionView() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    name: string | null; 
    email: string | null;
    phone: string | null;
    language: string | null;
    intent_english: string | null;
  } | null>(null);
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    
    const userId = typeof window !== 'undefined' ? localStorage.getItem('bicent_reg_id') || 'anonymous' : 'anonymous';

    try {
      const data = await extractData({ text, userId });
      setResult(data);
      toast({ title: "Intelligence Synced", description: "Global extraction data logged to balance registry." });
    } catch (error) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Universal parser failed to resolve input." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h2 className="text-3xl font-headline font-black uppercase tracking-tight flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" /> Global Extraction
        </h2>
        <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Universal Multilingual Parser v3.0</p>
      </div>

      <Card className="p-6 bg-card/40 border-border shadow-2xl rounded-3xl space-y-4 backdrop-blur-md">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Input Source (Any Language)</label>
          <Textarea 
            placeholder="Paste text in any language... e.g. 'Hola, soy Maria y mi correo es maria@demo.es. Quiero comprar Bitcoin.'" 
            className="min-h-[160px] bg-secondary/30 border-none rounded-2xl p-4 text-sm font-body leading-relaxed focus-visible:ring-primary shadow-inner"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleExtract} 
          disabled={loading || !text.trim()} 
          className="w-full h-14 bg-primary rounded-2xl font-headline font-black text-lg gap-3 shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
          INITIATE UNIVERSAL PARSE
        </Button>
      </Card>

      {result && (
        <Card className="p-6 bg-emerald-500/5 border-emerald-500/20 shadow-xl rounded-3xl animate-in zoom-in-95 duration-500">
          <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Global Intelligence Resolved
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-card/60 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Name</span>
              </div>
              <p className="font-headline font-bold text-base truncate">{result.name || "N/A"}</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Mail className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
              </div>
              <p className="font-code font-bold text-xs text-primary truncate">{result.email || "N/A"}</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Phone className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Phone</span>
              </div>
              <p className="font-code font-bold text-xs">{result.phone || "N/A"}</p>
            </div>
            <div className="p-4 bg-card/60 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Languages className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Language Code</span>
              </div>
              <p className="font-headline font-black text-xl text-emerald-500">{result.language?.toUpperCase() || "UNKN"}</p>
            </div>
            <div className="md:col-span-2 p-4 bg-card/60 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">English Intent Translation</span>
              </div>
              <p className="text-sm font-medium italic text-foreground/80 leading-snug">{result.intent_english || "N/A"}</p>
            </div>
          </div>
          <div className="mt-6 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Immutable registry entry confirmed.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
