
"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldCheck, Mail, ArrowLeft, RefreshCw, Loader2, KeyRound, Delete, CheckCircle2, AlertTriangle, Fingerprint, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { sendMfaCode } from "@/ai/flows/send-mfa-code";
import { useToast } from "@/hooks/use-toast";
import { BullLogo } from "@/components/brand/bull-logo";

interface AuthGateProps {
  t: (key: string) => string;
  masterPin: string;
  masterPassword: string;
  onVerify: () => void;
}

type GateMode = "auth" | "forgot-email" | "forgot-otp" | "forgot-reset";
type AuthState = "neutral" | "success" | "error" | "locked";
type AuthMethod = "pin" | "password";

export function AuthGate({
  t, masterPin, masterPassword, onVerify
}: AuthGateProps) {
  const [mode, setMode] = useState<GateMode>("auth");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("pin");
  const [pin, setPin] = useState<string[]>([]);
  const [passwordValue, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("neutral");
  const [attempts, setAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [remainingLockout, setRemainingLockout] = useState(0);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState<number>(0);
  
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Lockout Timer Logic
  useEffect(() => {
    if (lockoutTimer) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((lockoutTimer - Date.now()) / 1000));
        setRemainingLockout(remaining);
        if (remaining === 0) {
          setLockoutTimer(null);
          setAuthState("neutral");
          setAttempts(0);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  // Recovery Timer Logic
  useEffect(() => {
    if (expiryTime && mode === "forgot-otp") {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        setOtpTimeLeft(remaining);
        if (remaining === 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiryTime, mode]);

  const handleSuccess = () => {
    setAuthState("success");
    setTimeout(() => {
      onVerify();
    }, 1000);
  };

  const handleFailure = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setAuthState("error");
    
    if (nextAttempts >= 3) {
      setLockoutTimer(Date.now() + 30000);
      setAuthState("locked");
    } else {
      setTimeout(() => {
        setPin([]);
        setPasswordValue("");
        setAuthState("neutral");
      }, 1500);
    }
  };

  const handlePinKeyPress = (digit: string) => {
    if (authState === "locked" || authState === "success" || pin.length >= masterPin.length) return;
    setPin(prev => [...prev, digit]);
  };

  const handlePinDelete = () => {
    if (authState === "locked" || authState === "success") return;
    setPin(prev => prev.slice(0, -1));
  };

  const verifyPassword = () => {
    if (passwordValue === masterPassword) {
      handleSuccess();
    } else {
      handleFailure();
    }
  };

  useEffect(() => {
    // Dynamic length check based on masterPin length (per user request: "10" is 2 digits)
    if (authMethod === "pin" && pin.length === masterPin.length && authState === "neutral") {
      const enteredPin = pin.join("");
      if (enteredPin === masterPin) {
        handleSuccess();
      } else {
        handleFailure();
      }
    }
  }, [pin, masterPin, authState, authMethod]);

  const initiateRecovery = async () => {
    if (!recoveryEmail.includes("@")) return;
    setLoading(true);
    try {
      const result = await sendMfaCode({ email: recoveryEmail });
      if (result.success) {
        setGeneratedCode(result.code || null);
        setExpiryTime(result.expiresAt || null);
        setMode("forgot-otp");
        toast({ title: "Protocol Initiated", description: result.message });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Dispatch Failure", description: "Could not initiate secure dispatch." });
    } finally {
      setLoading(false);
    }
  };

  const resetMasterPin = () => {
    if (newPin !== confirmPin) {
      toast({ variant: "destructive", title: "Mismatch", description: "PIN synchronization failed." });
      return;
    }
    // Updated: PIN can be flexible length
    localStorage.setItem("mypal_master_pin", newPin);
    toast({ title: "Registry Updated", description: "New master PIN configured." });
    onVerify();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        
        {mode === "auth" && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <BullLogo className="h-16 w-16 text-primary mb-2" />
              <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">{t('terminal_locked')}</h1>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300",
                authState === "error" ? "text-destructive" : "text-muted-foreground"
              )}>
                {authState === "locked" 
                  ? "Access Denied: Terminal Lockout" 
                  : authState === "error" 
                    ? "Unauthorized Entry Detected" 
                    : "Secure Access Gateway"}
              </p>
            </div>

            <Tabs 
              value={authMethod} 
              onValueChange={(v) => {
                setAuthMethod(v as AuthMethod);
                setPin([]);
                setPasswordValue("");
                setAuthState("neutral");
              }} 
              className="w-full max-w-[280px]"
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/30 rounded-xl p-1">
                <TabsTrigger value="pin" className="text-[10px] font-black uppercase tracking-widest rounded-lg">PIN</TabsTrigger>
                <TabsTrigger value="password" className="text-[10px] font-black uppercase tracking-widest rounded-lg">Password</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col items-center gap-8 w-full">
              {authMethod === "pin" ? (
                <>
                  <div className={cn(
                    "flex gap-6 justify-center transition-all duration-300",
                    authState === "error" && "animate-shake",
                    authState === "locked" && "opacity-50"
                  )}>
                    {/* Render dots based on expected masterPin length */}
                    {Array.from({ length: masterPin.length }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-4 w-4 rounded-full border-2 transition-all duration-300",
                          pin.length > i 
                            ? authState === "success" 
                              ? "bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110" 
                              : authState === "error"
                                ? "bg-destructive border-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                : "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "border-border bg-transparent"
                        )}
                      />
                    ))}
                  </div>

                  <div className={cn(
                    "grid grid-cols-3 gap-4 w-full max-w-[280px] transition-all duration-300",
                    authState === "locked" && "opacity-20 pointer-events-none grayscale"
                  )}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((val, i) => (
                      <button
                        key={i}
                        disabled={val === "" || authState === "locked"}
                        onClick={() => val === "del" ? handlePinDelete() : handlePinKeyPress(val.toString())}
                        className={cn(
                          "h-16 w-16 rounded-full flex items-center justify-center text-xl font-headline font-black transition-all",
                          val === "" ? "invisible" : "bg-card border border-border hover:bg-secondary hover:scale-105 active:scale-95 shadow-lg",
                          val === "del" ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {val === "del" ? <Delete className="h-6 w-6" /> : val}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className={cn(
                  "w-full max-w-[280px] space-y-4 transition-all duration-300",
                  authState === "locked" && "opacity-50 pointer-events-none"
                )}>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t('master_password')}</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={cn(
                          "h-14 bg-secondary/30 border-none rounded-2xl pr-12 text-center text-lg font-code focus-visible:ring-primary shadow-inner",
                          authState === "error" && "ring-2 ring-destructive animate-shake"
                        )}
                        value={passwordValue}
                        onChange={(e) => setPasswordValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                        disabled={authState === "locked"}
                        autoFocus
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    onClick={verifyPassword}
                    disabled={!passwordValue || authState === "locked"}
                    className="w-full h-14 bg-primary rounded-2xl font-headline font-black text-lg uppercase tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    Unlock Protocol
                  </Button>
                </div>
              )}

              {authState === "locked" && (
                <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-code font-bold">Try again in {formatTime(remainingLockout)}</span>
                  </div>
                </div>
              )}

              <Button 
                variant="link" 
                className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setMode("forgot-email")}
              >
                {t('forgot_password')}
              </Button>
            </div>
          </div>
        )}

        {mode === "forgot-email" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">{t('verify_identity')}</h1>
              <p className="text-muted-foreground text-sm max-w-[280px]">{t('enter_recovery_email')}</p>
            </div>

            <Card className="p-8 bg-card border-border shadow-2xl rounded-3xl space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {t('email_address')}
                  </Label>
                  <Input 
                    type="email"
                    placeholder="recovery@gmail.com" 
                    className="h-14 bg-secondary/30 border-none rounded-2xl focus-visible:ring-primary shadow-inner font-code"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <Button 
                  disabled={loading || !recoveryEmail.includes("@")}
                  onClick={initiateRecovery}
                  className="w-full h-14 bg-primary rounded-2xl font-headline font-black text-lg gap-3 uppercase tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                  {t('send_reset_code')}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full h-10 uppercase text-[10px] font-black tracking-widest text-muted-foreground gap-2"
                  onClick={() => setMode("auth")}
                >
                  <ArrowLeft className="h-3 w-3" /> {t('cancel')}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {mode === "forgot-otp" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xl">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">{t('check_inbox')}</h1>
              <p className="text-muted-foreground text-sm max-w-[280px]">Verification code dispatched to your Gmail.</p>
            </div>

            <Card className="p-8 bg-card border-border shadow-2xl rounded-3xl space-y-6">
              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Input
                      key={i}
                      maxLength={1}
                      className="h-14 w-12 bg-secondary/30 border-none text-center font-code text-2xl focus-visible:ring-emerald-500 shadow-inner rounded-xl"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className={cn("text-[11px] font-black uppercase tracking-widest", otpTimeLeft > 0 ? "text-primary" : "text-rose-500")}>
                    {otpTimeLeft > 0 ? `${t('code_expires_in')} ${formatTime(otpTimeLeft)}` : "CODE EXPIRED"}
                  </p>
                  <Button 
                    variant="link" 
                    disabled={otpTimeLeft > 0 || loading}
                    className="text-[10px] uppercase font-bold text-muted-foreground hover:text-emerald-500"
                    onClick={initiateRecovery}
                  >
                    {t('resend')}
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setMode("forgot-reset")}
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-headline font-black text-lg gap-3 uppercase tracking-tighter shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Verify Protocol
                </Button>
              </div>
            </Card>
          </div>
        )}

        {mode === "forgot-reset" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-20 rounded-3xl bg-accent/10 flex items-center justify-center border border-accent/20 shadow-xl">
                <KeyRound className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">{t('reset_password')}</h1>
              <p className="text-muted-foreground text-sm max-w-[280px]">Configure your new master access PIN.</p>
            </div>

            <Card className="p-8 bg-card border-border shadow-2xl rounded-3xl space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    New PIN
                  </Label>
                  <Input 
                    type="password"
                    placeholder="••••" 
                    className="h-12 bg-secondary/30 border-none rounded-xl text-center text-2xl focus-visible:ring-accent shadow-inner font-code"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                    Confirm PIN
                  </Label>
                  <Input 
                    type="password"
                    placeholder="••••" 
                    className="h-12 bg-secondary/30 border-none rounded-xl text-center text-2xl focus-visible:ring-accent shadow-inner font-code"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                
                <Button 
                  disabled={!newPin || confirmPin !== newPin}
                  onClick={resetMasterPin}
                  className="w-full h-14 bg-accent text-accent-foreground rounded-2xl font-headline font-black text-lg gap-3 uppercase tracking-tighter shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
                >
                  {t('submit_reset')} <ShieldCheck className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        )}
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          SECURE ACCESS GATEWAY • BICENT TERMINAL V3.0
        </p>
      </div>
    </div>
  );
}
