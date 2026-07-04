
"use client";

import { Sun, Moon, Languages, Bell, Shield, Key, Mail, LogOut, CheckCircle2, Hash, ChevronRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SupportHumanIcon } from "@/components/brand/support-human-icon";

interface MoreViewProps {
  t: (key: string) => string;
  language: string;
  setLanguage: (val: string) => void;
  isNotificationsEnabled: boolean;
  setIsNotificationsEnabled: (val: boolean) => void;
  setShowNotificationDialog: (val: boolean) => void;
  setNotificationDialogMode: (mode: "enable" | "disable") => void;
  is2FAEnabled: boolean;
  setIs2FAEnabled: (val: boolean) => void;
  mfaMethod: "password" | "email";
  setMfaMethod: (val: "password" | "email") => void;
  masterPin: string;
  setMasterPin: (val: string) => void;
  masterPassword: string;
  setMasterPassword: (val: string) => void;
  mfaEmail: string;
  setMfaEmail: (val: string) => void;
  handleLogout: () => void;
  toggleTheme: () => void;
  theme: string;
  onNavigateToSupport?: () => void;
}

const SUPPORTED_LANGUAGES = [
  "English",
  "Kiswahili",
  "Français",
  "Español",
  "Deutsch",
  "Português",
  "العربية",
  "中文"
];

export function MoreView({
  t, language, setLanguage, isNotificationsEnabled, setIsNotificationsEnabled,
  setShowNotificationDialog, setNotificationDialogMode, is2FAEnabled, setIs2FAEnabled,
  mfaMethod, setMfaMethod, masterPin, setMasterPin, masterPassword, setMasterPassword, mfaEmail, setMfaEmail, 
  handleLogout, toggleTheme, theme, onNavigateToSupport
}: MoreViewProps) {
  return (
    <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full custom-scrollbar animate-in fade-in duration-700">
      <h2 className="text-3xl font-headline font-black mb-8 uppercase tracking-tight">{t('settings')}</h2>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-card/40 border-border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Sun className="h-5 w-5 text-primary" />
                <h4 className="font-headline font-bold">{t('display_theme')}</h4>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
          <Card className="p-6 bg-card/40 border-border shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <Languages className="h-5 w-5 text-primary" />
              <h4 className="font-headline font-bold">{t('language_region')}</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-10 text-xs bg-secondary/30 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        <Card 
          onClick={onNavigateToSupport}
          className="p-6 bg-primary/5 border-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <SupportHumanIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-headline font-black uppercase tracking-tight text-foreground">{t('support')}</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Protocol Liaison & Documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Initiate Protocol</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border-border shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <h4 className="font-headline font-black uppercase">{t('notifications')}</h4>
                <p className="text-[10px] text-muted-foreground uppercase">Market updates</p>
              </div>
            </div>
            <Switch checked={isNotificationsEnabled} onCheckedChange={(c) => { 
              setIsNotificationsEnabled(c); 
              setShowNotificationDialog(true); 
              setNotificationDialogMode(c ? "enable" : "disable"); 
            }} />
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border-border shadow-lg">
          <div className="flex items-center gap-4 mb-8">
            <Shield className="h-6 w-6 text-primary" />
            <h4 className="font-headline font-black uppercase">{t('security_access')}</h4>
          </div>

          <div className="space-y-8">
            <div 
              className={cn(
                "flex flex-col items-center gap-4 p-8 bg-secondary/20 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group",
                is2FAEnabled 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
              )}
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            >
              <div className={cn(
                "p-4 rounded-full transition-all duration-500",
                is2FAEnabled 
                  ? "bg-primary/20 text-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
                  : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
              )}>
                <Key className={cn("h-6 w-6 transition-transform duration-500", is2FAEnabled ? "scale-110 rotate-12" : "group-hover:scale-110")} />
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] block">
                  {is2FAEnabled ? "Security Protocol Active" : "Initiate Access Protocol"}
                </span>
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                  {is2FAEnabled ? "Tap to deactivate 2FA" : "Tap the key to enable 2FA protection"}
                </p>
              </div>
            </div>

            {is2FAEnabled && (
              <div className="space-y-10 animate-in fade-in slide-in-from-top-6 duration-500">
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-2">
                     <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t('choose_mfa_method')}</h5>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMfaMethod('password'); }}
                      className={cn(
                        "p-6 rounded-3xl border transition-all text-left flex flex-col gap-4 relative group",
                        mfaMethod === 'password' 
                          ? "bg-primary/5 border-primary shadow-xl" 
                          : "bg-secondary/10 border-border/30 hover:border-primary/20"
                      )}
                    >
                      {mfaMethod === 'password' && <CheckCircle2 className="h-5 w-5 text-primary absolute top-4 right-4 animate-in zoom-in duration-300" />}
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        mfaMethod === 'password' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block mb-1">{t('master_password')}</span>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter leading-tight">
                          Use your secure terminal password for verification.
                        </p>
                      </div>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setMfaMethod('email'); }}
                      className={cn(
                        "p-6 rounded-3xl border transition-all text-left flex flex-col gap-4 relative group",
                        mfaMethod === 'email' 
                          ? "bg-primary/5 border-primary shadow-xl" 
                          : "bg-secondary/10 border-border/30 hover:border-primary/20"
                      )}
                    >
                      {mfaMethod === 'email' && <CheckCircle2 className="h-5 w-5 text-primary absolute top-4 right-4 animate-in zoom-in duration-300" />}
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        mfaMethod === 'email' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest block mb-1">{t('email_verification')}</span>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter leading-tight">
                          Receive a secure one-time dispatch to your Gmail.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PIN Configuration always visible when 2FA on */}
                  <div className="p-6 bg-secondary/10 rounded-3xl border border-border/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Hash className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">{t('master_pin')}</h5>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Quick Terminal Unlock</p>
                      </div>
                    </div>
                    <Input 
                      type="password" 
                      placeholder="••••"
                      className="bg-secondary/30 border-none h-12 text-xl tracking-[0.5em] text-center font-code rounded-xl px-4 focus-visible:ring-primary shadow-inner" 
                      value={masterPin} 
                      onChange={(e) => setMasterPin(e.target.value.replace(/\D/g, ''))} 
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Password Configuration strictly conditional on method being 'password' */}
                  {mfaMethod === 'password' && (
                    <div className="p-6 bg-secondary/10 rounded-3xl border border-border/30 space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Lock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">{t('master_password')}</h5>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Secure Protocol Access</p>
                        </div>
                      </div>
                      <Input 
                        type="password" 
                        placeholder="Set Terminal Password"
                        className="bg-secondary/30 border-none h-12 text-sm font-code rounded-xl px-4 focus-visible:ring-primary shadow-inner" 
                        value={masterPassword} 
                        onChange={(e) => setMasterPassword(e.target.value)} 
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {/* Email Configuration strictly conditional on method being 'email' */}
                  {mfaMethod === 'email' && (
                    <div className="p-6 bg-secondary/10 rounded-3xl border border-border/30 space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">{t('email_address')}</h5>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Recovery Dispatch Node</p>
                        </div>
                      </div>
                      <Input 
                        placeholder="recovery@gmail.com" 
                        className="bg-secondary/30 border-none h-12 text-xs rounded-xl px-4 font-code focus-visible:ring-primary" 
                        value={mfaEmail} 
                        onChange={(e) => setMfaEmail(e.target.value)} 
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="pt-8 flex flex-col items-center gap-4">
          <Button variant="ghost" className="gap-3 text-rose-500 hover:text-rose-400 font-headline font-bold uppercase tracking-widest" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />{t('logout')}
          </Button>
        </div>
      </div>
    </div>
  );
}
