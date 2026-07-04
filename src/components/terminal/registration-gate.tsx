
"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, ChevronRightCircle, Globe, AlertCircle } from "lucide-react";
import { BullLogo } from "@/components/brand/bull-logo";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SUPPORTED_REGIONS = [
  "United States",
  "Kenya",
  "United Kingdom",
  "European Union",
  "Japan",
  "United Arab Emirates",
  "South Africa",
  "Nigeria",
  "India",
  "China",
  "Australia",
  "Brazil",
  "Switzerland",
  "Hong Kong",
  "Sweden",
  "Canada",
];

interface RegistrationGateProps {
  regName: string;
  setRegName: (val: string) => void;
  regPhone: string;
  setRegPhone: (val: string) => void;
  regGmail: string;
  setRegGmail: (val: string) => void;
  regRegion: string;
  setRegRegion: (val: string) => void;
  onSubmit: () => void;
  t: (key: string) => string;
}

export function RegistrationGate({
  regName, setRegName,
  regPhone, setRegPhone,
  regGmail, setRegGmail,
  regRegion, setRegRegion,
  onSubmit,
  t
}: RegistrationGateProps) {
  const [errors, setErrors] = useState<{
    name?: boolean;
    phone?: boolean;
    email?: boolean;
    region?: boolean;
  }>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string, region: string) => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, "");
    
    // Strict region-specific validation logic
    switch (region) {
      case "United States":
      case "Canada":
        // 10 digits or 1+10 digits
        return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
      case "Kenya":
        // Kenya numbers are 10 digits (07... or 01...) or 12 with 254 prefix
        return digits.startsWith("254") ? digits.length === 12 : (digits.length === 10 && (digits.startsWith("07") || digits.startsWith("01")));
      case "United Kingdom":
        // UK numbers are usually 11 digits starting with 07
        return digits.startsWith("44") ? (digits.length >= 11 && digits.length <= 13) : digits.length === 11;
      case "India":
        // India 10 digits
        return digits.startsWith("91") ? digits.length === 12 : digits.length === 10;
      case "Nigeria":
        // Nigeria 11 digits starting with 0
        return digits.startsWith("234") ? digits.length === 13 : digits.length === 11;
      default:
        // Generic length check for others
        return digits.length >= 7 && digits.length <= 15;
    }
  };

  const handlePreSubmit = () => {
    const isPhoneValid = validatePhone(regPhone, regRegion);
    const isEmailValid = validateEmail(regGmail);
    const isNameValid = regName.trim().length > 0;
    const isRegionValid = !!regRegion;

    const newErrors = {
      name: !isNameValid,
      phone: !isPhoneValid,
      email: !isEmailValid,
      region: !isRegionValid,
    };

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (!hasErrors) {
      onSubmit();
    }
  };

  // Intensity of error feedback: Clear error state on change but allow tracking for "glow"
  useEffect(() => { 
    if (regName) setErrors(prev => ({ ...prev, name: false })); 
  }, [regName]);

  useEffect(() => { 
    if (regPhone && regRegion) {
      // Real-time glow check: if user has typed enough and it's wrong, we can glow immediately
      // but usually we wait for submission or "blur" for a better UX. 
      // For this "Protocol" feel, we'll keep it on submittal but clear on type.
      setErrors(prev => ({ ...prev, phone: false })); 
    }
  }, [regPhone, regRegion]);

  useEffect(() => { 
    if (regGmail) setErrors(prev => ({ ...prev, email: false })); 
  }, [regGmail]);

  return (
    <div className="h-screen w-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <BullLogo className="h-16 w-16 text-primary" />
          <h1 className="text-3xl font-headline font-black tracking-tighter uppercase">BICENT Terminal</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Secure Balance Enrollment</p>
        </div>

        <Card className="p-8 bg-card border-border shadow-2xl rounded-3xl space-y-6">
          <div className="space-y-4">
            {/* Full Name Slot */}
            <div className="space-y-2">
              <Label className={cn(
                "text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors",
                errors.name ? "text-destructive" : "text-muted-foreground"
              )}>
                <User className="h-3 w-3" /> {t('full_name')}
              </Label>
              <Input 
                placeholder="John Doe" 
                className={cn(
                  "h-12 bg-secondary/30 border-none rounded-xl transition-all",
                  errors.name && "ring-2 ring-destructive shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse"
                )}
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            {/* Region Selection Slot */}
            <div className="space-y-2">
              <Label className={cn(
                "text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors",
                errors.region ? "text-destructive" : "text-muted-foreground"
              )}>
                <Globe className="h-3 w-3" /> {t('region')}
              </Label>
              <Select value={regRegion} onValueChange={setRegRegion}>
                <SelectTrigger className={cn(
                  "h-12 bg-secondary/30 border-none rounded-xl transition-all",
                  errors.region && "ring-2 ring-destructive shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                )}>
                  <SelectValue placeholder="Select Country/Region" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-60">
                  {SUPPORTED_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number Slot */}
            <div className="space-y-2">
              <Label className={cn(
                "text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors",
                errors.phone ? "text-destructive" : "text-muted-foreground"
              )}>
                <Phone className="h-3 w-3" /> {t('phone_number')}
              </Label>
              <Input 
                type="tel"
                placeholder="e.g. 254700000000" 
                className={cn(
                  "h-12 bg-secondary/30 border-none rounded-xl font-code transition-all",
                  errors.phone && "ring-2 ring-destructive shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse"
                )}
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
              {errors.phone && (
                <p className="text-[9px] text-destructive font-bold uppercase tracking-widest flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-2.5 w-2.5" /> Invalid protocol for {regRegion || 'selected region'}
                </p>
              )}
            </div>

            {/* Email Slot */}
            <div className="space-y-2">
              <Label className={cn(
                "text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-colors",
                errors.email ? "text-destructive" : "text-muted-foreground"
              )}>
                <Mail className="h-3 w-3" /> {t('email_address')}
              </Label>
              <Input 
                type="email"
                placeholder="recovery@gmail.com" 
                className={cn(
                  "h-12 bg-secondary/30 border-none rounded-xl font-code transition-all",
                  errors.email && "ring-2 ring-destructive shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse"
                )}
                value={regGmail}
                onChange={(e) => setRegGmail(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handlePreSubmit} className="w-full h-14 bg-primary rounded-2xl font-headline font-black text-lg gap-3 uppercase tracking-tighter hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
            Initiate Protocol <ChevronRightCircle className="h-5 w-5" />
          </Button>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          ENCRYPTED ENROLLMENT • SECURE STORAGE
        </p>
      </div>
    </div>
  );
}
