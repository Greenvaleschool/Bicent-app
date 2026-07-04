
"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Banknote, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Zap,
  Edit2,
  Check,
  Delete,
  CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/app/lib/countries";
import { useToast } from "@/hooks/use-toast";

interface AccountViewProps {
  t: (key: string) => string;
  balance: number;
  setBalance: (val: number | ((prev: number) => number)) => void;
  regName?: string;
  regGmail?: string;
  userRegion?: string;
  setRegName: (val: string) => void;
}

type AccountProtocol = "currency" | "withdrawal" | "deposit" | "shares" | null;
type TransactionStep = "registry" | "summary" | "pin" | "receipt";

export function AccountView({ 
  t, balance, setBalance, regName = "Terminal Operator", regGmail = "ops@mypal.com", userRegion = "United States", setRegName 
}: AccountViewProps) {
  const [activeProtocol, setActiveProtocol] = useState<AccountProtocol>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(regName);
  
  const [transactionStep, setTransactionStep] = useState<TransactionStep>("registry");
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [authState, setAuthState] = useState<"neutral" | "success" | "error" | "locked">("neutral");
  const [receipt, setReceipt] = useState<any>(null);

  const { toast } = useToast();
  const homeCountry = COUNTRIES.find(c => c.name === userRegion) || COUNTRIES[0];
  const masterPin = typeof window !== 'undefined' ? localStorage.getItem("mypal_master_pin") || "1234" : "1234";

  const handlePinKeyPress = (digit: string) => {
    if (authState === "locked" || authState === "success" || pinDigits.length >= 4) return;
    setPinDigits(prev => [...prev, digit]);
  };

  useEffect(() => {
    // Strictly 4-digit check for transactions
    if (pinDigits.length === 4 && authState === "neutral") {
      if (pinDigits.join("") === masterPin) {
        setAuthState("success");
        setTimeout(() => {
          const amount = 5000;
          const isDeposit = activeProtocol === "deposit";
          setBalance(prev => isDeposit ? prev + amount : prev - amount);
          setReceipt({
            amount,
            type: isDeposit ? 'deposit' : 'withdrawal',
            currency: homeCountry.symbol,
            date: new Date().toLocaleString()
          });
          setTransactionStep("receipt");
        }, 1000);
      } else {
        setAuthState("error");
        setTimeout(() => { setPinDigits([]); setAuthState("neutral"); }, 1500);
      }
    }
  }, [pinDigits, masterPin, authState, activeProtocol, setBalance, homeCountry.symbol]);

  const protocols = [
    { id: "currency", name: "Currency", icon: <Banknote className="h-5 w-5" />, color: "text-primary", bg: "bg-primary/10" },
    { id: "withdrawal", name: "Withdrawal", icon: <ArrowUpRight className="h-5 w-5" />, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "deposit", name: "Deposit", icon: <ArrowDownLeft className="h-5 w-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "shares", name: "Shares", icon: <Globe className="h-5 w-5" />, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-700 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-8 mb-8">
        <Avatar className="h-24 w-24 border-4 border-primary shadow-2xl">
          <AvatarFallback className="bg-primary/10 text-primary font-headline font-black text-3xl">
            {regName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-headline font-black uppercase tracking-tighter">{regName}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit">Authorized Operator</p>
          <div className="mt-4 p-4 bg-muted/30 rounded-2xl border border-border flex flex-col min-w-[200px]">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Terminal Balance</span>
            <span className="text-2xl font-code font-black text-emerald-500">{homeCountry.symbol}{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {protocols.map((p) => (
          <Card key={p.id} onClick={() => { setActiveProtocol(p.id as AccountProtocol); setTransactionStep("registry"); }} className={cn("p-4 bg-card/40 border-border cursor-pointer transition-all hover:ring-2 hover:ring-primary", activeProtocol === p.id && "ring-2 ring-primary")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", p.bg, p.color)}>{p.icon}</div>
              <span className="text-[10px] font-headline font-black uppercase tracking-widest">{p.name}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex-1">
        {(activeProtocol === "deposit" || activeProtocol === "withdrawal") && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            {transactionStep === "registry" && (
              <Card className="p-12 bg-card/40 border-border rounded-[2.5rem] shadow-2xl flex flex-col items-center border-dashed border-2">
                <h4 className="text-xl font-headline font-black uppercase tracking-tighter mb-10">Select Verified Liquidity Node</h4>
                <button onClick={() => setTransactionStep("summary")} className="w-full max-w-md p-16 bg-primary/5 rounded-[3rem] border border-primary/20 flex flex-col items-center gap-8 transition-all hover:scale-[1.02] hover:bg-primary/10 shadow-2xl">
                  <div className="p-10 rounded-full bg-primary/10 text-primary"><CreditCard className="h-16 w-16" /></div>
                  <div className="text-center">
                    <span className="text-4xl font-headline font-black uppercase tracking-tight">PayPal</span>
                    <p className="text-[12px] font-code font-black text-primary uppercase tracking-[0.2em] mt-2">Verified Global Protocol</p>
                  </div>
                </button>
                <p className="mt-8 text-[9px] text-muted-foreground uppercase font-black tracking-widest">Exclusive high-fidelity financial bridge enabled.</p>
              </Card>
            )}

            {transactionStep === "summary" && (
              <div className="flex justify-center"><Card className="p-8 bg-card/60 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
                <div className="text-center"><h4 className="text-xl font-headline font-black uppercase tracking-tighter">Execution Summary</h4></div>
                <div className="p-6 bg-secondary/20 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between"><span className="text-[9px] font-black text-muted-foreground uppercase">Recipient</span><span className="text-xs font-bold uppercase">{regName}</span></div>
                  <div className="flex justify-between"><span className="text-[9px] font-black text-muted-foreground uppercase">Amount</span><span className="text-lg font-code font-black text-primary">{homeCountry.symbol}5,000.00</span></div>
                </div>
                <Button onClick={() => setTransactionStep("pin")} className="w-full h-14 rounded-2xl font-headline font-black uppercase bg-primary shadow-lg">Authorize Protocol</Button>
              </Card></div>
            )}

            {transactionStep === "pin" && (
              <div className="flex justify-center py-10"><Card className="p-8 bg-card border-border shadow-2xl rounded-[2rem] max-w-sm w-full space-y-8 text-center">
                <h1 className="text-2xl font-headline font-black uppercase tracking-tighter">Verification</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enter 4-digit Transaction Code</p>
                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-4 w-4 rounded-full border-2 transition-all", pinDigits.length > i ? "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "border-border")} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 w-full">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((val, i) => (
                    <button key={i} onClick={() => val === "del" ? setPinDigits(prev => prev.slice(0, -1)) : handlePinKeyPress(val.toString())} className={cn("h-14 rounded-xl flex items-center justify-center font-black text-lg", val === "" ? "invisible" : "bg-secondary/30 border border-white/5 hover:bg-secondary/60 transition-all")}>
                      {val === "del" ? <Delete className="h-5 w-5" /> : val}
                    </button>
                  ))}
                </div>
              </Card></div>
            )}

            {transactionStep === "receipt" && receipt && (
              <div className="flex justify-center py-10"><Card className="p-8 bg-card border-border shadow-2xl rounded-3xl max-w-md w-full text-center space-y-6">
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xl"><CheckCircle2 className="h-10 w-10" /></div>
                <h1 className="text-2xl font-headline font-black uppercase tracking-tighter">Protocol Finalized</h1>
                <div className="space-y-4 p-6 bg-secondary/10 rounded-2xl text-left text-[10px] font-code uppercase">
                  <div className="flex justify-between"><span>Amount:</span><span className="text-emerald-500">{receipt.currency}{receipt.amount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Balance:</span><span>{receipt.currency}{balance.toLocaleString()}</span></div>
                </div>
                <Button onClick={() => setActiveProtocol(null)} className="w-full h-12 bg-secondary font-headline font-black uppercase">Return to Registry</Button>
              </Card></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
