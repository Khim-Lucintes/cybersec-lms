"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LessonAudioPlayer({ title, summaryText }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayAudio = () => {
    if (!("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Reset any existing speech

    const textToSpeak = `${title}. Key Concepts: ${summaryText}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Optimize Voice & Cadence for Learning
    utterance.rate = 0.95; // Slightly slower, clear lecture pace
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleResetAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2 p-2 px-3 rounded-lg bg-[#002D62]/5 border border-[#002D62]/10 text-xs">
      <div className="flex items-center gap-1.5 text-[#002D62] font-medium font-serif">
        <Volume2 className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
        <span className="text-[11px]">Audio Briefing:</span>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={handlePlayAudio}
        className={`h-6 text-[10px] px-2.5 rounded-md font-medium transition-all gap-1 ${
          isPlaying
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-[#002D62] hover:bg-[#001F44] text-white"
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="h-3 w-3" /> Pause Briefing
          </>
        ) : (
          <>
            <Play className="h-3 w-3 text-[#C5A059]" /> Listen Summary
          </>
        )}
      </Button>

      {isPlaying && (
        <button
          type="button"
          onClick={handleResetAudio}
          title="Stop Audio"
          className="p-1 rounded text-[#777] hover:text-[#002D62] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
