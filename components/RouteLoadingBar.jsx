"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

export function RouteLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      {/* Top micro progress line */}
      <div className="h-[2.5px] w-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#002D62] via-[#C5A059] to-[#002D62] animate-progress" />
      </div>
    </div>
  );
}

export function ForensicSkeletonLoader({ title = "Loading Forensics Lab..." }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
      <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-64 bg-slate-100 rounded-md" />
        </div>
        <div className="h-7 w-24 bg-slate-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-white rounded-xl border border-slate-200/60 p-4 space-y-3">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-4/5 bg-slate-100 rounded" />
        </div>
        <div className="h-32 bg-white rounded-xl border border-slate-200/60 p-4 space-y-3">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-4/5 bg-slate-100 rounded" />
        </div>
        <div className="h-32 bg-white rounded-xl border border-slate-200/60 p-4 space-y-3">
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-4/5 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}
