"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  subscribeToMaintenanceStatus,
  getMaintenanceStatus,
  fetchCloudMaintenanceStatus
} from "@/lib/maintenanceService";

export function SystemMaintenanceLockout() {
  const [maintenanceInfo, setMaintenanceInfo] = useState({ active: false });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial local check
    const initial = getMaintenanceStatus();
    if (initial?.active) {
      setMaintenanceInfo(initial);
    }

    // Subscribe to multi-channel updates (BroadcastChannel, storage events, Supabase cloud sync)
    const unsubscribe = subscribeToMaintenanceStatus((status) => {
      setMaintenanceInfo(status || { active: false });
    });

    return () => unsubscribe();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const cloud = await fetchCloudMaintenanceStatus();
      if (cloud) {
        setMaintenanceInfo(cloud);
      } else {
        setMaintenanceInfo(getMaintenanceStatus());
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (!maintenanceInfo?.active) {
    return null;
  }

  return (
    <div
      id="system-maintenance-lockout"
      style={{ zIndex: 999999 }}
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-amber-500/50 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Institutional Header Ribbon */}
        <div className="bg-gradient-to-r from-[#001F44] via-[#002D62] to-[#001F44] p-6 text-white text-center relative border-b border-amber-500/30">
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-3 shadow-inner">
            <svg
              className="h-8 w-8 animate-pulse text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-amber-400 mb-1">
            FSUU IT Data Center • Clearance Lockout
          </div>
          <h2 className="text-xl font-bold font-serif tracking-tight text-white">
            System Maintenance in Progress
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
            Urios CyberLearn Platform Access Temporarily Suspended
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-amber-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Administrative Clearance Protocol Active</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-amber-900/90">
              {maintenanceInfo.message ||
                "The platform is undergoing critical database synchronization, official academic examinations, or system grading updates."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-400 font-mono text-[10px]">ESTIMATED DURATION</div>
              <div className="font-bold text-[#002D62] font-mono mt-0.5">
                {maintenanceInfo.estimatedDuration || "15-30 Minutes"}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-400 font-mono text-[10px]">INITIATED BY</div>
              <div className="font-bold text-[#002D62] truncate mt-0.5">
                {maintenanceInfo.initiatedBy || "System Administrator"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="truncate">
              Live listener connected • Automatic dismissal upon release.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Return to Portal Home
          </Link>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#002D62] hover:bg-[#001F44] text-[#C5A059] text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-75 cursor-pointer"
          >
            <svg
              className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            {isRefreshing ? "Checking..." : "Refresh Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
