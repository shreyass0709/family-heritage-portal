"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

class Soundscape {
  ctx: AudioContext | null = null;
  chimeInterval: ReturnType<typeof setInterval> | null = null;
  windOsc: OscillatorNode | null = null;
  windLfo: OscillatorNode | null = null;
  isPlaying = false;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("AudioContext not supported");
      }
      this.ctx = new AudioContextClass();
      this.isPlaying = true;

      // 1. Start gentle low-frequency breeze wind drone
      this.startWind();

      // 2. Start chimes loop (chimes chime randomly every 4-8 seconds)
      this.chimeInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          this.playChime();
        }
      }, 5000);

      // Play initial chime on start
      this.playChime();
    } catch (err) {
      console.error("Web Audio context failed to initialize:", err);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.chimeInterval) clearInterval(this.chimeInterval);
    try {
      if (this.windOsc) this.windOsc.stop();
      if (this.windLfo) this.windLfo.stop();
    } catch {}
    if (this.ctx) {
      this.ctx.close();
    }
    this.isPlaying = false;
  }

  startWind() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Wind carrier oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, now); // Deep coastal breeze drone

    // LFO to swell the wind volume slowly
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, now); // 0.12Hz cycle
    lfoGain.gain.setValueAtTime(0.015, now);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    gain.gain.setValueAtTime(0.012, now); // base level
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    lfo.start(now);

    this.windOsc = osc;
    this.windLfo = lfo;
  }

  playChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Select 3 random high frequencies to form a harmonic wind chime chime
    const baseFreq = 500 + Math.random() * 600;
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2.2];
    const gainNode = this.ctx.createGain();
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.018, now + 0.04); // Instant attack
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // Very slow ring decay
    
    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gainNode);
      osc.start(now);
      osc.stop(now + 6);
    });

    // Echo feedback loop to simulate porch acoustic resonance
    const delay = this.ctx.createDelay();
    delay.delayTime.setValueAtTime(0.5, now);
    const feedback = this.ctx.createGain();
    feedback.gain.setValueAtTime(0.35, now);

    delay.connect(feedback);
    feedback.connect(delay);
    gainNode.connect(delay);
    
    gainNode.connect(this.ctx.destination);
    delay.connect(this.ctx.destination);
  }
}

export default function AmbientPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundscapeRef = useRef<Soundscape | null>(null);

  useEffect(() => {
    soundscapeRef.current = new Soundscape();
    return () => {
      if (soundscapeRef.current) {
        soundscapeRef.current.stop();
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!soundscapeRef.current) return;
    if (isPlaying) {
      soundscapeRef.current.stop();
      setIsPlaying(false);
    } else {
      soundscapeRef.current.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-slate-950/60 hover:bg-slate-950/90 border border-gold/20 hover:border-gold/50 px-3 py-1.5 rounded-full backdrop-blur-md transition-all shadow-lg select-none">
      {/* Audio Wave Visualizer Bars */}
      <div className="flex items-end gap-[2px] h-3 w-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-[2px] bg-gold rounded-full transition-all duration-300 origin-bottom ${
              isPlaying ? "animate-pulse" : "h-1"
            }`}
            style={{
              height: isPlaying ? "100%" : "30%",
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>

      <button
        onClick={togglePlayback}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-gold cursor-pointer transition-colors focus:outline-none"
        title={isPlaying ? "Mute Ambient Soundscape" : "Play Ambient Soundscape"}
      >
        {isPlaying ? (
          <>
            <Volume2 size={12} className="text-gold" />
            <span>Mute</span>
          </>
        ) : (
          <>
            <VolumeX size={12} className="text-slate-400" />
            <span>Sound</span>
          </>
        )}
      </button>
    </div>
  );
}
