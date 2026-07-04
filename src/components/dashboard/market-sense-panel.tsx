
"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Terminal, 
  Briefcase, 
  Table as TableIcon, 
  TrendingUp, 
  AlertCircle,
  Activity
} from "lucide-react";
import { marketSenseTrendSummary } from "@/ai/flows/market-sense-trend-summary";
import { marketSenseTradeIdeas } from "@/ai/flows/market-sense-trade-ideas";
import { marketSenseChat } from "@/ai/flows/market-sense-chat";
import { marketSenseGenerateImage } from "@/ai/flows/market-sense-image";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Message {
  role: 'bot' | 'user';
  content: string;
  type?: 'text' | 'trade-idea' | 'image' | 'trend-analysis';
  data?: any;
}

export function MarketSensePanel({ symbol, language = "English" }: { symbol: string, language?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "MarketSense active. Monitoring global trends. How can I assist your market analysis today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    const processedText = text.replace("[SYMBOL]", symbol);
    if (!processedText.trim()) return;
    
    const userMsg: Message = { role: 'user', content: processedText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const lowerText = processedText.toLowerCase();
      
      if (lowerText.includes('photo') || lowerText.includes('cinematic') || lowerText.includes('draw')) {
        const result = await marketSenseGenerateImage({ prompt: processedText });
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Visualization generated:",
          type: 'image',
          data: result.imageUrl
        }]);
      } 
      else if (lowerText.includes('trade idea')) {
        const result = await marketSenseTradeIdeas({ symbol });
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: result.rationale,
          type: 'trade-idea',
          data: result
        }]);
      } 
      else if (lowerText.includes('trend') || lowerText.includes('analyze')) {
        const result = await marketSenseTrendSummary({ query: processedText });
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: result.executiveSummary,
          type: 'trend-analysis',
          data: result
        }]);
      } 
      else {
        const result = await marketSenseChat({ message: processedText, language });
        setMessages(prev => [...prev, { role: 'bot', content: result.response }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Execution error. Please check system logs or re-initiate." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-card/40 backdrop-blur-sm border-none shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-headline font-bold text-sm tracking-tight uppercase">MarketSense AI</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3 max-w-[95%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white/5", msg.role === 'user' ? "bg-accent/10" : "bg-primary/10")}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-accent" /> : <Bot className="h-4 w-4 text-primary" />}
              </div>
              <div className="space-y-2 flex-1">
                <div className={cn("p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-sm", msg.role === 'user' ? "bg-primary/10 text-foreground rounded-tr-none border border-primary/20" : "bg-secondary/40 text-foreground rounded-tl-none border border-white/5")}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
        </div>
      </ScrollArea>

      <div className="p-4 bg-background/60 border-t border-white/5">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <Input placeholder="Analyze market trends..." className="bg-secondary/50 border border-white/5 focus-visible:ring-primary h-10 text-xs" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button size="icon" disabled={loading || !input.trim()} type="submit" className="h-10 w-10 shrink-0 bg-primary"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </Card>
  );
}
