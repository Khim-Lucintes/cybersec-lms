"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  ChevronLeft,
  Building2,
  Sparkles,
  LockKeyhole
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Check URL hash and query string for expired token errors or access denied
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";

      if (
        hash.includes("error=access_denied") ||
        hash.includes("error_code=otp_expired") ||
        search.includes("error=access_denied") ||
        search.includes("error_code=otp_expired")
      ) {
        setIsTokenExpired(true);
        setErrorMsg(
          "This password recovery link is invalid or has expired for security compliance (RA 10173). Please ask your institutional administrator to dispatch a new link, or sign in via your registered credentials."
        );
      }
    }
  }, []);

  // Real-time password criteria verification
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaMet = [hasMinLength, hasUppercase, hasLowercase, hasNumberOrSpecial].filter(Boolean).length;
  const isMatch = password && confirmPassword && password === confirmPassword;
  const isFormValid = criteriaMet === 4 && isMatch;

  // Strength status text and color
  const strengthDetails = (() => {
    if (password.length === 0) return { label: "Awaiting Input", color: "bg-slate-200", text: "text-slate-400" };
    if (criteriaMet <= 2) return { label: "Weak Security", color: "bg-rose-500", text: "text-rose-600" };
    if (criteriaMet === 3) return { label: "Moderate Security", color: "bg-amber-500", text: "text-amber-600" };
    return { label: "Strong & Compliant", color: "bg-emerald-500", text: "text-emerald-600" };
  })();

  // Automatic redirect countdown upon success
  useEffect(() => {
    if (!successMsg) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [successMsg, router]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!hasMinLength) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update password. Your reset link may have expired.");
      } else {
        setSuccessMsg("Your security credentials have been updated successfully in the FSUU CCJE Directory.");
      }
    } catch (err) {
      setErrorMsg("An unexpected network error occurred while securing your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001F44] text-white flex flex-col justify-between font-sans selection:bg-[#C5A059] selection:text-[#001F44] relative overflow-hidden">
      {/* Background Institutional Watermark & Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#002D62] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#C5A059] rounded-full blur-3xl opacity-10 pointer-events-none" />

      {/* Top University Navigation Header */}
      <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md px-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-full p-0.5 bg-gradient-to-tr from-[#C5A059] to-[#002D62] shadow-sm shrink-0 overflow-hidden ring-1 ring-white/20">
            <img src="/fsuu_seal.jpg" alt="FSUU CCJE Seal" className="h-full w-full object-cover rounded-full" />
          </div>
          <div>
            <div className="font-bold text-white text-xs sm:text-sm font-serif tracking-tight uppercase">
              Father Saturnino Urios University
            </div>
            <div className="text-[10px] text-[#C5A059] font-mono tracking-wider">
              College of Criminal Justice Education
            </div>
          </div>
        </div>

        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-white/20 text-white bg-white/5 hover:bg-white/15 cursor-pointer font-medium gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to Portal</span>
          </Button>
        </Link>
      </header>

      {/* Main Interactive Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-6">
        <div className="w-full max-w-lg bg-white text-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Card Top Banner */}
          <div className="p-6 bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#002D62] text-white flex items-center justify-between border-b border-white/10 relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#C5A059] shadow-inner">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-serif tracking-tight text-white">
                  Account Credential Recovery
                </h1>
                <p className="text-[11px] text-[#C5A059] font-mono tracking-wide">
                  RA 10173 Secure Authentication Gateway
                </p>
              </div>
            </div>

            <Badge className="bg-[#C5A059] text-[#001F44] font-mono font-bold text-[9px] uppercase hidden sm:inline-flex">
              Level 1 Clearance
            </Badge>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Error Notification */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div className="text-xs text-rose-900 leading-relaxed font-medium">
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Success State */}
            {successMsg ? (
              <div className="py-8 px-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#002D62] font-serif">
                    Password Successfully Secured!
                  </h2>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Your new institutional password has been registered. You will be redirected to the secure login gateway in{" "}
                    <span className="font-bold text-[#002D62] font-mono">{countdown} seconds</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-10 px-6 font-bold rounded-xl gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Proceed to Portal Login Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : isTokenExpired ? (
              /* Expired Link State */
              <div className="py-6 text-center space-y-4">
                <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#002D62] font-serif">
                    Expired Security Token
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    For your institutional privacy protection, password recovery tokens expire after 24 hours.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-[#002D62] hover:bg-[#001F44] text-white text-xs h-9 px-5 rounded-xl font-semibold cursor-pointer"
                  >
                    Return to Login Screen
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Password Reset Form */
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter and verify your new institutional account password. Ensure your password complies with university security mandates.
                </p>

                {/* Field 1: New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002D62] block">
                    New Account Password *
                  </label>
                  <div className="relative flex items-center group">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#002D62] transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 8 characters..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002D62]/15 focus:border-[#002D62] transition-all font-mono text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="space-y-1 pt-1 animate-in fade-in">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-500">Security Strength:</span>
                        <span className={`font-bold ${strengthDetails.text}`}>{strengthDetails.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${strengthDetails.color}`}
                          style={{ width: `${(criteriaMet / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 2: Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#002D62] block">
                    Confirm New Password *
                  </label>
                  <div className="relative flex items-center group">
                    <LockKeyhole className="absolute left-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[#002D62] transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter your new password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all font-mono text-slate-800 ${
                        confirmPassword.length > 0
                          ? isMatch
                            ? "border-emerald-400 focus:ring-emerald-200"
                            : "border-rose-400 focus:ring-rose-200"
                          : "border-slate-200 focus:ring-[#002D62]/15 focus:border-[#002D62]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Match Feedback */}
                  {confirmPassword.length > 0 && (
                    <div className="text-[10.5px] font-mono flex items-center gap-1.5 pt-0.5">
                      {isMatch ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1 font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Policy Checklist (Real-Time Dynamic Feedback) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-[#002D62] font-serif">
                    University Password Requirements:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px] font-mono">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                      {hasMinLength ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-0.5 shrink-0" />}
                      <span>8+ characters</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                      {hasUppercase ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-0.5 shrink-0" />}
                      <span>Uppercase letter (A-Z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                      {hasLowercase ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-0.5 shrink-0" />}
                      <span>Lowercase letter (a-z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasNumberOrSpecial ? "text-emerald-700 font-semibold" : "text-slate-500"}`}>
                      {hasNumberOrSpecial ? <Check className="h-3 w-3 text-emerald-600 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mx-0.5 shrink-0" />}
                      <span>Number or symbol</span>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full h-11 bg-[#002D62] hover:bg-[#001F44] text-white rounded-xl text-xs font-bold shadow-md transition-all gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#C5A059]" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
                      <span>Set Secure Password &amp; Login</span>
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Back to Home Link */}
            <div className="pt-3 border-t border-slate-100 text-center">
              <Link
                href="/"
                className="text-xs font-bold text-slate-500 hover:text-[#002D62] transition-colors inline-flex items-center gap-1.5 font-mono"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Return to Public Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* University Institutional Footer */}
      <footer className="py-4 px-6 border-t border-white/10 text-center text-[10.5px] text-slate-400 font-mono relative z-20">
        <p>
          Father Saturnino Urios University • College of Criminal Justice Education • San Francisco St., Butuan City, Philippines
        </p>
        <p className="text-[#C5A059] mt-0.5">
          Republic Act 10173 (Data Privacy Act of 2012) • Secure Electronic Identity Protection Standard
        </p>
      </footer>
    </div>
  );
}
