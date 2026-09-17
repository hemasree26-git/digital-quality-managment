import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Cpu, 
  FileCheck2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+1', country: 'US / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
];

export const LoginScreen: React.FC = () => {
  const { loginWithOtp } = useAuth();
  
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('5552348910');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Quality Manager');
  
  // Flow states
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(45);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate phone number: minimum 7 digits
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 7) {
      setErrorMessage('Please enter a valid mobile number (minimum 7 digits).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      // Pre-fill demo OTP code '842910' for instant testing or let user type
      setOtp(['8', '4', '2', '9', '1', '0']);
      setCountdown(45);
      setTimerActive(true);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const success = loginWithOtp(phoneNumber, countryCode, selectedRole, fullOtp);
      if (!success) {
        setErrorMessage('Verification failed. Please check the code.');
      }
    }, 500);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setCountdown(45);
    setTimerActive(true);
    setOtp(['8', '4', '2', '9', '1', '0']);
  };

  const quickDemoSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPhoneNumber('5552348910');
    setStep('otp');
    setOtp(['8', '4', '2', '9', '1', '0']);
    setCountdown(45);
    setTimerActive(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Digital Quality Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Zero-defect manufacturing, digital audits & AI analytics
          </p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            <Cpu className="w-3 h-3" /> Enterprise Plant Portal v3.4
          </span>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'phone' ? (
          /* STEP 1: Phone Number & Role Input */
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-800/80 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                {/* Country code selector */}
                <div className="relative border-r border-slate-700">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="appearance-none bg-transparent pl-3 pr-7 py-3 text-sm text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-slate-200">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative flex-1 flex items-center">
                  <Smartphone className="w-4 h-4 text-slate-400 ml-3" />
                  <input
                    id="phone-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    required
                    className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Role selection dropdown for demo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Access Role (Demo Preview)
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Quality Manager">Quality Manager (Full Plant Oversight & CAPA)</option>
                  <option value="Inspector">Inspector (Shop Floor Audits & Checklists)</option>
                  <option value="Auditor">Auditor (Compliance & ISO-9001 Sign-off)</option>
                  <option value="Admin">Admin (Full System & RBAC Configuration)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Roles define granular permissions (Read, Write, Approve, Delete, Export).
              </p>
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {isLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  6-Digit OTP Verification
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Change Number
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Code sent to <span className="font-mono text-slate-200">{countryCode} {phoneNumber}</span> (pre-filled for preview)
              </p>

              {/* 6 OTP boxes */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-mono font-bold bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Countdown / Resend row */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                Signing in as: <strong className="text-slate-200">{selectedRole}</strong>
              </span>

              {countdown > 0 ? (
                <span>Resend in <strong className="font-mono text-indigo-400">{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" /> Resend Code
                </button>
              )}
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              {isLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Enter DQM</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Pre-fill shortcuts */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Instant Demo Sign-In
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickDemoSelect('Inspector')}
              className="px-2 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors text-center"
            >
              <span className="block font-medium">Inspector</span>
              <span className="text-[10px] text-slate-400">Audits & QC</span>
            </button>

            <button
              type="button"
              onClick={() => quickDemoSelect('Quality Manager')}
              className="px-2 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 text-xs text-indigo-200 transition-colors text-center"
            >
              <span className="block font-medium">Manager</span>
              <span className="text-[10px] text-indigo-400">CAPA & AI</span>
            </button>

            <button
              type="button"
              onClick={() => quickDemoSelect('Admin')}
              className="px-2 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors text-center"
            >
              <span className="block font-medium">Admin</span>
              <span className="text-[10px] text-slate-400">RBAC Matrix</span>
            </button>
          </div>
        </div>

      </div>

      {/* Compliance accreditation footer */}
      <div className="mt-6 text-xs text-slate-400 flex items-center gap-4">
        <span className="flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> ISO 9001:2015</span>
        <span className="flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> IATF 16949</span>
        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> FDA 21 CFR Part 11</span>
      </div>
    </div>
  );
};
