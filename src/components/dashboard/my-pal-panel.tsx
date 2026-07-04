'use client';

import { useState, useRef, useEffect, useMemo } from "react";
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
  RefreshCw, 
  Trash2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { myPalChat } from "@/ai/flows/my-pal-chat";
import { myPalGenerateImage } from "@/ai/flows/my-pal-image";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, getDocs, writeBatch } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  role: 'bot' | 'user';
  content: string;
  imageUrl?: string;
  id?: string;
}

export function MyPalPanel({ symbol, language = "English", t }: { symbol: string, language?: string, t: (key: string) => string }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const userId = typeof window !== 'undefined' ? (localStorage.getItem('mypal_reg_gmail') || 'anonymous').replace(/[^a-zA-Z0-9]/g, '_') : 'anonymous';

  const chatQuery = useMemo(() => {
    if (!db || !userId) return null;
    return query(collection(db, 'users', userId, 'chats'), orderBy('timestamp', 'asc'), limit(50));
  }, [db, userId]);

  const { data: dbMessages, loading: messagesLoading } = useCollection(chatQuery);

  const messages = useMemo(() => {
    if (!dbMessages || dbMessages.length === 0) {
      return [{ 
        role: 'bot', 
        content: `Hey there! 👋 I'm **MyPal**, your Personal Assistant Liaison.\n\nI can help you with:\n📈 Market trends & values\n💼 Business terms & metrics\n💰 Investment concepts\n🏢 Financial analysis\n\nTry asking me about: EBITDA, ROI, stocks, crypto, real estate, inflation, NSE, M-Pesa, or any business term!`
      } as Message];
    }
    return dbMessages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'bot',
      content: m.content,
      imageUrl: m.imageUrl,
      id: m.id
    }));
  }, [dbMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setInput("");
    setLoading(true);

    try {
      const lowerText = text.toLowerCase();
      
      if (lowerText.startsWith('/draw') || lowerText.startsWith('generate image')) {
        const promptText = text.replace('/draw', '').replace('generate image', '').trim();
        await myPalGenerateImage({ prompt: promptText || text, language, userId });
      } else {
        await myPalChat({ message: text, language, userId });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Communication Failure",
        description: "Protocol disrupted. Please re-initiate."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (!db || !userId) return;
    setIsClearing(true);
    try {
      const chatRef = collection(db, 'users', userId, 'chats');
      const snapshot = await getDocs(chatRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({
        title: "Session Purged",
        description: "Memory cleared. Protocol reset."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to purge session."
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-[#0a0c10] border-none shadow-2xl overflow-hidden rounded-[2rem]">
      <div className="p-5 flex items-center justify-between bg-[#0a0c10]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-headline font-black text-xs tracking-[0.1em] uppercase text-primary">MYPAL AI</h3>
            <p className="text-[9px] text-muted-foreground font-bold tracking-[0.05em] uppercase opacity-60">PERSONAL ASSISTANT LIAISON</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border shadow-2xl rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline font-black uppercase tracking-tight flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500" />
                  {t('purge_history')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This will permanently delete the current conversation history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl font-bold uppercase tracking-widest text-[10px]">{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearChat}
                  disabled={isClearing}
                  className="bg-rose-500 hover:bg-rose-600 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                >
                  {isClearing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                  {t('confirm_purge')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <div className="flex items-center gap-4">
            {messagesLoading && <RefreshCw className="h-4 w-4 text-primary animate-spin" />}
            <div className="h-2 w-2 rounded-full bg-[#3ecf8e] shadow-[0_0_10px_rgba(62,207,142,0.6)]" />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={msg.id || i} className={cn("flex gap-4 max-w-[92%] animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-lg", 
                msg.role === 'user' ? "bg-accent/10 border-accent/20" : "bg-primary border-primary/20"
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-accent" /> : <Sparkles className="h-4 w-4 text-white" />}
              </div>
              <div className="space-y-2 flex-1">
                <div className={cn(
                  "p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-xl font-body border", 
                  msg.role === 'user' 
                    ? "bg-primary/10 text-foreground rounded-tr-none border-primary/20" 
                    : "bg-[#161b22] text-[#c9d1d9] rounded-tl-none border-white/5"
                )}>
                  {msg.content}
                  {msg.imageUrl && (
                    <div className="mt-4 relative aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                      <Image 
                        src={msg.imageUrl} 
                        alt="Generated by mypal ai" 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-primary animate-pulse ml-4 mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Processing intelligence...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 bg-[#0a0c10] border-t border-white/5">
        <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <div className="relative flex-1">
            <Input 
              placeholder="Ask about markets, business terms..." 
              className="bg-[#161b22] border-[#30363d] h-12 placeholder:text-muted-foreground/30 text-sm rounded-xl pl-5 focus-visible:ring-primary shadow-inner" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={messagesLoading || loading}
            />
          </div>
          <Button 
            size="icon" 
            disabled={loading || !input.trim() || messagesLoading} 
            type="submit" 
            className="h-12 w-12 shrink-0 bg-[#21262d] hover:bg-[#30363d] text-white rounded-xl transition-all border border-[#30363d]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="flex items-center gap-2 mt-4 px-2 opacity-30">
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
            {t('privacy_protocol')}
          </p>
        </div>
      </div>
    </Card>
  );
}
