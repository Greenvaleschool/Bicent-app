
"use client";

import { useState, useMemo, useEffect } from "react";
import { Asset, INITIAL_ASSETS } from "@/app/lib/mock-data";
import { TRANSLATIONS } from "@/app/lib/translations";
import { COUNTRIES } from "@/app/lib/countries";
import { 
  ArrowLeftRight,
  BarChart3,
  Globe,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Wallet,
  Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, deleteDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { NavItem } from "@/components/terminal/nav-item";
import { TerminalSplash } from "@/components/terminal/terminal-splash";
import { RegistrationGate } from "@/components/terminal/registration-gate";
import { AuthGate } from "@/components/terminal/auth-gate";
import { BullLogo } from "@/components/brand/bull-logo";

import { ChartsView } from "@/components/terminal/views/charts-view";
import { MarketView } from "@/components/terminal/views/market-view";
import { TradeView } from "@/components/terminal/views/trade-view";
import { MyPalView } from "@/components/terminal/views/mypal-view";
import { AccountView } from "@/components/terminal/views/account-view";
import { MoreView } from "@/components/terminal/views/more-view";
import { SupportView } from "@/components/terminal/views/support-view";

type View = "Charts" | "Market" | "Trade" | "Mypal" | "Account" | "More" | "Support";

export default function TerminalPage() {
  const [activeView, setActiveView] = useState<View>("Charts");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(INITIAL_ASSETS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [hasHydrated, setHasHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States");

  const [isRegistered, setIsRegistered] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regGmail, setRegGmail] = useState("");
  const [balance, setBalance] = useState(0);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationDialogMode, setNotificationDialogMode] = useState<"enable" | "disable">("enable");

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<"password" | "email">("password");
  const [isVerified, setIsVerified] = useState(false);
  
  const [masterPin, setMasterPin] = useState("1234");
  const [masterPassword, setMasterPassword] = useState("binchiling");
  const [mfaEmail, setMfaEmail] = useState("");

  const [latency, setLatency] = useState(0);
  const [netStatus, setNetStatus] = useState("Connecting...");

  const { theme, toggleTheme } = useTheme();
  const db = useFirestore();
  const { toast } = useToast();

  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS["English"][key] || key;

  const currencySymbol = useMemo(() => {
    const country = COUNTRIES.find(c => c.name === region);
    return country?.symbol || "$";
  }, [region]);

  useEffect(() => {
    const savedReg = localStorage.getItem("mypal_is_registered") === "true";
    const savedRegName = localStorage.getItem("mypal_reg_name") || "";
    const savedRegPhone = localStorage.getItem("mypal_reg_phone") || "";
    const savedRegGmail = localStorage.getItem("mypal_reg_gmail") || "";
    const savedBalance = parseFloat(localStorage.getItem("mypal_balance") || "0");
    const savedPin = localStorage.getItem("mypal_master_pin") || "1234";
    const savedPassword = localStorage.getItem("mypal_master_password") || "binchiling";

    setIsRegistered(savedReg);
    setRegName(savedRegName);
    setRegPhone(savedRegPhone);
    setRegGmail(savedRegGmail);
    setBalance(savedBalance);
    setMasterPin(savedPin);
    setMasterPassword(savedPassword);
    
    setIsVerified(false); // Require verification on start if 2FA enabled
    setHasHydrated(true);

    const timer = setTimeout(() => setShowSplash(false), 2000);

    async function testSupabase() {
      try {
        const { error } = await supabase.from('Users').select('*').limit(1);
        if (error) {
          const { error: fError } = await supabase.from('users').select('*').limit(1);
          if (fError) console.warn('[SUPABASE: INFO] Connectivity discovery active. Nodes uninitialized.');
          else console.log('[SUPABASE: SUCCESS] Handshake via fallback node.');
        } else {
          console.log('[SUPABASE: SUCCESS] Handshake via primary node.');
        }
      } catch (err) {
        console.debug('[SUPABASE: DISRUPTION] Test protocol offline.');
      }
    }
    testSupabase();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !isRegistered || !db || !regGmail) return;
    const userId = regGmail.replace(/[^a-zA-Z0-9]/g, '_');
    const syncData = { displayName: regName, phone: regPhone, email: regGmail, region, language, balance, isNotificationsEnabled, is2FAEnabled, masterPin, masterPassword, preferredTheme: theme };
    
    setDoc(doc(db, "users", userId), syncData, { merge: true }).catch(() => {});
    
    supabase.from('Users').upsert({ id: userId, ...syncData, updated_at: new Date().toISOString() }).then(({ error }) => {
      if (error) {
        supabase.from('users').upsert({ id: userId, ...syncData, updated_at: new Date().toISOString() }).then(() => {});
      }
    });
  }, [balance, regName, regPhone, regGmail, isRegistered, hasHydrated, theme, masterPin, masterPassword, language, region, isNotificationsEnabled, is2FAEnabled]);

  const handleRegistrationSubmit = () => {
    const userId = regGmail.replace(/[^a-zA-Z0-9]/g, '_');
    const regData = { displayName: regName, phone: regPhone, email: regGmail, region, registeredAt: serverTimestamp(), balance: 0, preferredTheme: theme };
    
    if (db) setDoc(doc(db, "users", userId), regData, { merge: true }).catch(() => {});
    
    supabase.from('Users').upsert({ id: userId, ...regData, registered_at: new Date().toISOString() }).then(({ error }) => {
      if (error) {
        supabase.from('users').upsert({ id: userId, ...regData, registered_at: new Date().toISOString() }).then(() => {});
      }
    });

    setBalance(0);
    setIsRegistered(true);
    localStorage.setItem("mypal_is_registered", "true");
    localStorage.setItem("mypal_reg_name", regName);
    localStorage.setItem("mypal_reg_gmail", regGmail);
    toast({ title: "Protocol Activated" });
  };

  if (!hasHydrated || showSplash) return <TerminalSplash />;
  if (!isRegistered) return <RegistrationGate regName={regName} setRegName={setRegName} regPhone={regPhone} setRegPhone={setRegPhone} regGmail={regGmail} setRegGmail={setRegGmail} regRegion={region} setRegRegion={setRegion} onSubmit={handleRegistrationSubmit} t={t} />;
  if (!isVerified && is2FAEnabled) return <AuthGate t={t} masterPin={masterPin} masterPassword={masterPassword} onVerify={() => setIsVerified(true)} />;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden animate-in fade-in duration-700">
      <aside className={cn("bg-card border-r border-border transition-all duration-300 flex flex-col z-30 shadow-2xl relative", isSidebarOpen ? "w-64" : "w-20")}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40">
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="p-6 flex items-center justify-center gap-3 h-20"><BullLogo className="h-8 w-8 text-primary" />{isSidebarOpen && <span className="font-headline font-black text-2xl">BICENT</span>}</div>
        <nav className="flex-1 px-4 space-y-2 py-4">
          <NavItem icon={<BarChart3 />} label={t('charts')} active={activeView === "Charts"} isSidebarOpen={isSidebarOpen} onClick={() => setActiveView("Charts")} />
          <NavItem icon={<Globe />} label={t('market')} active={activeView === "Market"} isSidebarOpen={isSidebarOpen} onClick={() => setActiveView("Market")} />
          <NavItem icon={<ArrowLeftRight />} label={t('trade')} active={activeView === "Trade"} isSidebarOpen={isSidebarOpen} onClick={() => setActiveView("Trade")} />
          <NavItem icon={<Bell />} label={t('mypal')} active={activeView === "Mypal"} isSidebarOpen={isSidebarOpen} onClick={() => setActiveView("Mypal")} />
          <NavItem icon={<User />} label={t('account')} active={activeView === "Account"} isSidebarOpen={isSidebarOpen} onClick={() => setActiveView("Account")} />
          <NavItem icon={<MoreHorizontal />} label={t('more')} active={activeView === "More"} isSidebarOpen={isSidebarOpen} onClick={() => setActiveView("More")} />
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-muted/30", !isSidebarOpen && "justify-center")}><Wifi className={cn("h-6 w-6", latency > 0 ? "text-primary" : "text-muted-foreground")} />{isSidebarOpen && <div className="flex flex-col"><span className="text-[10px] font-bold text-muted-foreground uppercase">Network</span><span className="text-xs font-code font-bold text-primary">Connected</span></div>}</div>
          <div className={cn("flex items-center gap-3 p-3 rounded-xl bg-muted/30", !isSidebarOpen && "justify-center")}><Wallet className="h-6 w-6 text-emerald-500" />{isSidebarOpen && <div className="flex flex-col"><span className="text-[10px] font-bold text-muted-foreground uppercase">Balance</span><span className="text-xs font-code font-bold text-emerald-500">{currencySymbol}{balance.toLocaleString()}</span></div>}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          <span className="font-headline font-bold text-lg text-muted-foreground uppercase">{t(activeView.toLowerCase())}</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
        </header>
        <main className="flex-1 overflow-hidden flex p-4 gap-4 bg-background">
          {activeView === "Charts" && <ChartsView selectedAsset={selectedAsset} t={t} balance={balance} setBalance={setBalance} currencySymbol={currencySymbol} />}
          {activeView === "Market" && <MarketView selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset} t={t} />}
          {activeView === "Trade" && <TradeView selectedAsset={selectedAsset} trades={[]} deleteTrade={() => {}} t={t} balance={balance} setBalance={setBalance} currencySymbol={currencySymbol} />}
          {activeView === "Mypal" && <MyPalView selectedAsset={selectedAsset} language={language} t={t} />}
          {activeView === "Account" && <AccountView t={t} balance={balance} setBalance={setBalance} regName={regName} regGmail={regGmail} userRegion={region} setRegName={setRegName} />}
          {activeView === "More" && <MoreView t={t} language={language} setLanguage={setLanguage} isNotificationsEnabled={isNotificationsEnabled} setIsNotificationsEnabled={setIsNotificationsEnabled} setShowNotificationDialog={setShowNotificationDialog} setNotificationDialogMode={setNotificationDialogMode} is2FAEnabled={is2FAEnabled} setIs2FAEnabled={setIs2FAEnabled} mfaMethod={mfaMethod} setMfaMethod={setMfaMethod} masterPin={masterPin} setMasterPin={setMasterPin} masterPassword={masterPassword} setMasterPassword={setMasterPassword} mfaEmail={mfaEmail} setMfaEmail={setMfaEmail} handleLogout={() => { localStorage.clear(); window.location.reload(); }} toggleTheme={toggleTheme} theme={theme} />}
          {activeView === "Support" && <SupportView t={t} />}
        </main>
      </div>
    </div>
  );
}
