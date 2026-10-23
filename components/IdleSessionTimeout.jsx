"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ShieldAlert, Clock, LogOut, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Institutional Inactivity Thresholds (CDI 409 & RA 10173 Data Privacy Compliance)
// Default: 15 minutes total inactivity (900,000 ms), with a 60-second warning countdown dialog
const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION_SECONDS = 60; // 60 seconds warning countdown
const STORAGE_ACTIVITY_KEY = "cdi409_last_activity";
const STORAGE_TIMEOUT_OVERRIDE_KEY = "cdi409_idle_timeout_ms";

export function IdleSessionTimeout({ 
  timeoutMs: propTimeoutMs, 
  warningSeconds = WARNING_DURATION_SECONDS 
}) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningSeconds);

  const lastActivityRef = useRef(Date.now());
  const lastStorageWriteRef = useRef(Date.now());
  const isLoggingOutRef = useRef(false);

  // Determine effective timeout duration (allows optional local storage override for testing/institutional policy)
  const getEffectiveTimeoutMs = useCallback(() => {
    if (propTimeoutMs) return propTimeoutMs;
    if (typeof window !== "undefined") {
      const override = localStorage.getItem(STORAGE_TIMEOUT_OVERRIDE_KEY);
      if (override) {
        const parsed = Number(override);
        if (!isNaN(parsed) && parsed > 5000) return parsed;
      }
    }
    return DEFAULT_IDLE_TIMEOUT_MS;
  }, [propTimeoutMs]);

  // Clean Institutional Logout & Redirect to Landing with Security Notice
  const handlePerformLogout = useCallback(async (reason = "inactivity") => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("student_profile");
        localStorage.removeItem("user_role");
        localStorage.removeItem(STORAGE_ACTIVITY_KEY);
        localStorage.setItem("session_timeout_notice", reason);
      }
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout notice:", err);
    } finally {
      setShowWarning(false);
      // Hard redirect to clear client memory state and trigger landing page timeout modal
      window.location.href = "/?timeout=inactivity";
    }
  }, []);

  // Explicit user interaction (clicking "Stay Logged In")
  const recordExplicitActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastStorageWriteRef.current = now;

    try {
      localStorage.setItem(STORAGE_ACTIVITY_KEY, now.toString());
    } catch (e) {}

    setShowWarning(false);
    setSecondsRemaining(warningSeconds);
  }, [warningSeconds]);

  // 1. DEDICATED COUNTDOWN TIMER EFFECT
  // Runs ONLY when `showWarning` is true, ensuring it is never cancelled prematurely by activity re-renders
  useEffect(() => {
    if (!showWarning) return;

    const countdownTimer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          handlePerformLogout("inactivity");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [showWarning, handlePerformLogout]);

  // 2. MULTI-TAB SYNCHRONIZATION EFFECT
  // If user is active in another tab, sync the last activity timestamp and dismiss any warning in this tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_ACTIVITY_KEY && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (!isNaN(remoteTime)) {
          lastActivityRef.current = remoteTime;
          if (showWarning) {
            setShowWarning(false);
            setSecondsRemaining(warningSeconds);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [showWarning, warningSeconds]);

  // 3. USER ACTIVITY LISTENERS & INACTIVITY HEARTBEAT CHECKER
  useEffect(() => {
    // Initialize initial activity timestamp
    const initialTime = Date.now();
    lastActivityRef.current = initialTime;
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVITY_KEY);
      if (!stored || Date.now() - Number(stored) > 10000) {
        localStorage.setItem(STORAGE_ACTIVITY_KEY, initialTime.toString());
      }
    } catch (e) {}

    // Activity event listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
      "click"
    ];

    const handleUserInteraction = () => {
      // If warning modal is showing, do not passively reset via mousemove — user must click "Stay Logged In"
      if (showWarning) return;

      const now = Date.now();
      lastActivityRef.current = now;

      // Throttle localStorage updates to avoid spamming storage on every pixel move
      if (now - lastStorageWriteRef.current > 2000) {
        lastStorageWriteRef.current = now;
        try {
          localStorage.setItem(STORAGE_ACTIVITY_KEY, now.toString());
        } catch (e) {}
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Check inactivity every 1 second for instant precision
    const heartbeatChecker = setInterval(() => {
      if (isLoggingOutRef.current) return;

      const effectiveTimeout = getEffectiveTimeoutMs();
      const warningThreshold = Math.max(1000, effectiveTimeout - warningSeconds * 1000);

      // Get latest active time across all tabs
      let latestActive = lastActivityRef.current;
      try {
        const stored = localStorage.getItem(STORAGE_ACTIVITY_KEY);
        if (stored) {
          const parsed = Number(stored);
          if (!isNaN(parsed) && parsed > latestActive) {
            latestActive = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch (e) {}

      const now = Date.now();
      const idleMs = now - latestActive;

      // If user has been idle beyond the total timeout (e.g. laptop closed or sitting idle)
      if (idleMs >= effectiveTimeout) {
        handlePerformLogout("inactivity");
        return;
      }

      // If user has reached the warning threshold and warning is not yet shown
      if (idleMs >= warningThreshold && !showWarning) {
        const remainingMs = effectiveTimeout - idleMs;
        const remainingSec = Math.max(1, Math.min(warningSeconds, Math.round(remainingMs / 1000)));
        setSecondsRemaining(remainingSec);
        setShowWarning(true);
      }
    }, 1000);

    // Developer / Testing helper: expose instant trigger in browser console
    if (typeof window !== "undefined") {
      window.__testIdleSessionTimeout = () => {
        setSecondsRemaining(warningSeconds);
        setShowWarning(true);
        console.log("Session Inactivity Warning triggered manually for verification.");
      };
      window.__setIdleTimeoutMinutes = (minutes) => {
        const ms = minutes * 60 * 1000;
        localStorage.setItem(STORAGE_TIMEOUT_OVERRIDE_KEY, ms.toString());
        console.log(`Inactivity timeout set to ${minutes} minutes (${ms} ms). Refresh page to apply.`);
      };
    }

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
      clearInterval(heartbeatChecker);
    };
  }, [showWarning, warningSeconds, getEffectiveTimeoutMs, handlePerformLogout]);

  if (!showWarning) return null;

  const percentLeft = Math.round((secondsRemaining / warningSeconds) * 100);
  const isUrgent = secondsRemaining <= 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="inactivity-dialog-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
      >
        {/* Top Header Banner */}
        <div className="p-5 bg-gradient-to-r from-[#002D62] via-[#001F44] to-[#002D62] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              isUrgent 
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" 
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 id="inactivity-dialog-title" className="text-base font-bold font-serif tracking-tight text-white">
                Session Inactivity Warning
              </h3>
              <p className="text-[10px] text-amber-300 font-mono tracking-wider uppercase">
                RA 10173 Security &amp; Compliance Protocol
              </p>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
            isUrgent 
              ? "bg-rose-500/20 text-rose-200 border-rose-400/40 animate-pulse" 
              : "bg-white/10 text-[#C5A059] border-white/10"
          }`}>
            {secondsRemaining}s
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            You have been inactive for an extended period. To protect your digital evidence records, investigation dockets, and privacy compliance, your session will automatically log out in:
          </p>

          {/* Countdown Display Card */}
          <div className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-colors ${
            isUrgent ? "bg-rose-50/60 border-rose-200" : "bg-slate-50 border-slate-200"
          }`}>
            <div className={`text-3xl font-bold font-mono tracking-tight flex items-baseline gap-1 ${
              isUrgent ? "text-rose-600 animate-pulse" : "text-[#002D62]"
            }`}>
              <span>{secondsRemaining}</span>
              <span className="text-sm font-normal text-slate-500">seconds remaining</span>
            </div>

            {/* Depleting Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  isUrgent 
                    ? "bg-gradient-to-r from-rose-500 to-red-600" 
                    : "bg-gradient-to-r from-amber-500 to-[#C5A059]"
                }`}
                style={{ width: `${percentLeft}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <ShieldAlert className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
            <span>FSUU CCJE Criminology Cybercrime Portal</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => handlePerformLogout("manual")}
            className="text-xs h-9 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-500" />
            <span>Sign Out Now</span>
          </Button>

          <Button
            type="button"
            onClick={recordExplicitActivity}
            className="text-xs h-9 bg-[#002D62] hover:bg-[#001F44] text-white font-semibold gap-1.5 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-[#C5A059]" />
            <span>Stay Logged In</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
