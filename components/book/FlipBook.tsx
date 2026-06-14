"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Flame, 
  Compass, 
  Moon, 
  Sparkles
} from "lucide-react";
import { StoryChapter } from "@/types/story";
import { cn } from "@/lib/utils";

// Web Audio API Sound Synthesizer
const playSynthesizedSound = (type: 'flip' | 'open' | 'close', isMuted: boolean) => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'flip') {
      // Synthesize paper swoosh noise
      const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      
      const gain = ctx.createGain();
      
      // Sweep frequency down to mimic paper rustling
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.45);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);
      
      // Gain envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
      noise.stop(ctx.currentTime + 0.5);
    } else if (type === 'open') {
      // Leather creak and low thud
      // 1. Creak noise
      const creakLen = ctx.sampleRate * 0.7;
      const creakBuf = ctx.createBuffer(1, creakLen, ctx.sampleRate);
      const creakData = creakBuf.getChannelData(0);
      for (let i = 0; i < creakLen; i++) {
        creakData[i] = Math.random() * 2 - 1;
      }
      const creakSource = ctx.createBufferSource();
      creakSource.buffer = creakBuf;
      
      const creakFilter = ctx.createBiquadFilter();
      creakFilter.type = 'bandpass';
      creakFilter.frequency.setValueAtTime(260, ctx.currentTime);
      creakFilter.frequency.linearRampToValueAtTime(340, ctx.currentTime + 0.4);
      
      const creakGain = ctx.createGain();
      creakGain.gain.setValueAtTime(0, ctx.currentTime);
      creakGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.08);
      creakGain.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.3);
      creakGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      
      creakSource.connect(creakFilter);
      creakFilter.connect(creakGain);
      creakGain.connect(ctx.destination);
      creakSource.start();
      
      // 2. Low thud
      const osc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.35);
      
      thudGain.gain.setValueAtTime(0, ctx.currentTime);
      thudGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04);
      thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(thudGain);
      thudGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'close') {
      // Deep thud
      const osc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(70, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
      
      thudGain.gain.setValueAtTime(0, ctx.currentTime);
      thudGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.04);
      thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.connect(thudGain);
      thudGain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.error("Synthesizer failed:", e);
  }
};

interface FlipBookProps {
  chapters: StoryChapter[];
}

export default function FlipBook({ chapters }: FlipBookProps) {
  // Page spreads:
  // 0: Closed front cover
  // 1: Opened spread 1 (Left: Table of Contents | Right: Chapter 1)
  // 2: Opened spread 2 (Left: Chapter 2 | Right: Chapter 3)
  // ...
  // N: Closed back cover
  const [currentSpread, setCurrentSpread] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippingSheet, setFlippingSheet] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Reading Mode States
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [theme, setTheme] = useState<'study' | 'candlelight' | 'night'>('study');
  const [isMuted, setIsMuted] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  const totalSheets = Math.ceil((chapters.length + 1) / 2); // Dynamic sheets count
  const totalSpreads = totalSheets + 2;

  // Autoplay effect
  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      if (currentSpread < totalSpreads - 1) {
        handleNext();
      } else {
        setAutoplay(false);
      }
    }, 4500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, currentSpread, totalSpreads]);

  // Dynamic scale calculation based on container element width
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          // Calculate scale to fit inside container with padding
          const newScale = Math.min(1, (width - 32) / 920);
          setScale(newScale);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function handleNext() {
    if (isFlipping || currentSpread >= totalSpreads) return;
    
    setIsFlipping(true);
    setDirection('next');
    setHasInteracted(true);
    
    // Play synthesized sound
    if (currentSpread === 0) {
      playSynthesizedSound('open', isMuted);
    } else if (currentSpread === totalSpreads - 1) {
      playSynthesizedSound('close', isMuted);
    } else {
      playSynthesizedSound('flip', isMuted);
    }
    
    // Determine which sheet is turning dynamically
    if (currentSpread >= 1 && currentSpread <= totalSheets) {
      setFlippingSheet(currentSpread - 1);
    } else {
      setFlippingSheet(null);
    }
    
    setCurrentSpread((prev) => prev + 1);
    
    // Smooth transition timeout: Cover animations take 850ms, pages take 650ms
    const timeoutDuration = (currentSpread === 0 || currentSpread === totalSpreads - 1) ? 850 : 650;
    
    setTimeout(() => {
      setIsFlipping(false);
      setFlippingSheet(null);
      setDirection(null);
    }, timeoutDuration);
  };

  function handlePrev() {
    if (isFlipping || currentSpread <= 0) return;
    
    setIsFlipping(true);
    setDirection('prev');
    setHasInteracted(true);
    
    // Play synthesized sound
    if (currentSpread === 1) {
      playSynthesizedSound('close', isMuted);
    } else if (currentSpread === totalSpreads) {
      playSynthesizedSound('open', isMuted);
    } else {
      playSynthesizedSound('flip', isMuted);
    }
    
    // Determine which sheet is turning dynamically (going back)
    if (currentSpread >= 2 && currentSpread <= totalSheets + 1) {
      setFlippingSheet(currentSpread - 2);
    } else {
      setFlippingSheet(null);
    }
    
    setCurrentSpread((prev) => prev - 1);
    
    // Cover animations take 850ms, pages take 650ms
    const timeoutDuration = (currentSpread === 1 || currentSpread === totalSpreads) ? 850 : 650;
    
    setTimeout(() => {
      setIsFlipping(false);
      setFlippingSheet(null);
      setDirection(null);
    }, timeoutDuration);
  };

  // Jump helper for Table of Contents click navigation
  const handleJumpToSpread = (targetSpread: number) => {
    if (isFlipping || targetSpread === currentSpread) return;
    
    setIsFlipping(true);
    setHasInteracted(true);
    playSynthesizedSound('flip', isMuted);
    
    const isGoingForward = targetSpread > currentSpread;
    setDirection(isGoingForward ? 'next' : 'prev');
    
    // Sheet to show turning visual cue
    if (isGoingForward && currentSpread >= 1 && currentSpread <= totalSheets) {
      setFlippingSheet(currentSpread - 1);
    } else if (!isGoingForward && currentSpread >= 2 && currentSpread <= totalSheets + 1) {
      setFlippingSheet(currentSpread - 2);
    } else {
      setFlippingSheet(null);
    }

    setCurrentSpread(targetSpread);
    
    setTimeout(() => {
      setIsFlipping(false);
      setFlippingSheet(null);
      setDirection(null);
    }, 650);
  };

  // Helpers to calculate depth z-indexing
  const getSheetZIndex = (sheetIdx: number) => {
    const isFlipped = sheetIdx < currentSpread - 1;
    return isFlipped ? sheetIdx + 1 : totalSheets - sheetIdx;
  };

  const getLeftCoverZIndex = () => {
    if (isFlipping && ((currentSpread === 1 && direction === 'next') || (currentSpread === 0 && direction === 'prev'))) {
      return 50;
    }
    if (currentSpread === 0) return 20; // Closed top-most right
    if (currentSpread === totalSpreads) return 1; // Closed bottom-most left
    return 2;
  };

  const getRightCoverZIndex = () => {
    if (isFlipping && ((currentSpread === totalSpreads && direction === 'next') || (currentSpread === totalSpreads - 1 && direction === 'prev'))) {
      return 50;
    }
    if (currentSpread === totalSpreads) return 20; // Closed top-most left
    if (currentSpread === 0) return 1; // Closed bottom-most right
    return 2;
  };

  // Class getters for covers
  const getLeftCoverClass = () => {
    if (!hasInteracted) return "book-cover-left";
    if (isFlipping) {
      if (currentSpread === 1 && direction === 'next') return "book-cover-left cover-opening";
      if (currentSpread === 0 && direction === 'prev') return "book-cover-left cover-closing";
    }
    return "book-cover-left";
  };

  const getRightCoverClass = () => {
    if (!hasInteracted) return "book-cover-right";
    if (isFlipping) {
      if (currentSpread === totalSpreads && direction === 'next') return "book-cover-right cover-closing-back";
      if (currentSpread === totalSpreads - 1 && direction === 'prev') return "book-cover-right cover-opening-back";
    }
    return "book-cover-right";
  };

  // Drop cap generator inside book content
  const renderTextContent = (text: string) => {
    if (!text) return null;
    const trimmed = text.trim();
    const firstChar = trimmed.charAt(0);
    const rest = trimmed.slice(1);
    
    // Detect letters (English or Kannada Unicode ranges)
    const isLetter = /^[A-Za-z\u0C80-\u0CFF]/.test(firstChar);
    
    const sizeClasses = {
      sm: "text-xs leading-relaxed",
      md: "text-sm leading-relaxed",
      lg: "text-base leading-relaxed"
    };

    if (isLetter) {
      return (
        <p className={cn("text-amber-900 font-serif whitespace-pre-line text-justify", sizeClasses[fontSize])}>
          <span className="drop-cap-gold">{firstChar}</span>
          {rest}
        </p>
      );
    }

    return (
      <p className={cn("text-amber-900 font-serif whitespace-pre-line text-justify", sizeClasses[fontSize])}>
        {trimmed}
      </p>
    );
  };

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto flex flex-col items-center select-none py-4 relative">
      
      {/* 3D ENVIRONMENT VIEWPORT */}
      <div className="flex flex-col items-center w-full">
        
        {/* Advanced Toolbar Controls Panel */}
        <div className="flex flex-wrap items-center justify-center md:justify-between w-full max-w-[920px] bg-slate-950/80 backdrop-blur-md border border-white/10 px-4 py-2.5 md:px-6 md:py-3 rounded-2xl md:rounded-full shadow-2xl mb-6 text-slate-300 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gold"><Sparkles size={16} /></span>
            <span className="text-xs font-serif font-semibold tracking-wider uppercase text-amber-200">Poojari Chronicles</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs">
            {/* Ambient Desk Theme Buttons */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <button 
                onClick={() => setTheme('study')}
                className={cn(
                  "p-1.5 rounded transition-all flex items-center gap-1 cursor-pointer",
                  theme === 'study' ? "bg-amber-900/50 text-gold font-bold border border-gold/30" : "hover:text-slate-100"
                )}
                title="Scholar Study (Walnut Wood)"
              >
                <Compass size={13} /> Study
              </button>
              <button 
                onClick={() => setTheme('candlelight')}
                className={cn(
                  "p-1.5 rounded transition-all flex items-center gap-1 cursor-pointer",
                  theme === 'candlelight' ? "bg-orange-900/50 text-orange-400 font-bold border border-orange-500/30" : "hover:text-slate-100"
                )}
                title="Candlelight Glow (Warm Mahogany)"
              >
                <Flame size={13} className="text-orange-400" /> Glow
              </button>
              <button 
                onClick={() => setTheme('night')}
                className={cn(
                  "p-1.5 rounded transition-all flex items-center gap-1 cursor-pointer",
                  theme === 'night' ? "bg-slate-900 text-sky-400 font-bold border border-sky-500/30" : "hover:text-slate-100"
                )}
                title="Vintage Night (Charcoal Ebony)"
              >
                <Moon size={13} /> Night
              </button>
            </div>

            {/* Font Zoom Controls */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <span className="text-slate-400 mr-1">Size:</span>
              <button 
                onClick={() => setFontSize('sm')} 
                className={cn("px-2 py-0.5 rounded cursor-pointer", fontSize === 'sm' && "bg-white/10 font-bold text-white")}
              >A-</button>
              <button 
                onClick={() => setFontSize('md')} 
                className={cn("px-2 py-0.5 rounded cursor-pointer", fontSize === 'md' && "bg-white/10 font-bold text-white")}
              >A</button>
              <button 
                onClick={() => setFontSize('lg')} 
                className={cn("px-2 py-0.5 rounded cursor-pointer", fontSize === 'lg' && "bg-white/10 font-bold text-white")}
              >A+</button>
            </div>

            {/* Autoplay Controls */}
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all",
                autoplay ? "bg-gold text-slate-950 font-semibold" : "bg-white/5 hover:bg-white/10"
              )}
            >
              {autoplay ? (
                <>
                  <Pause size={13} />
                  <span>Autoplay ON</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 dot-pulse-gold inline-block ml-0.5" />
                </>
              ) : (
                <>
                  <Play size={13} />
                  <span>Autoplay</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-400 hover:text-slate-100"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Scaling Wrapper for 3D Book */}
        <div 
          style={{
            width: '100%',
            height: `${580 * scale}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          }}
          className="transition-all duration-300"
        >
          {/* Outer 3D mahogany Wood Desk Mock Frame */}
          <div 
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              flexShrink: 0,
            }}
            className={cn(
              "relative w-[920px] h-[580px] flex items-center justify-center book-desk p-6 transition-all duration-[950ms]",
              theme === 'study' ? "theme-study" : theme === 'candlelight' ? "theme-candlelight" : "theme-night"
            )}
          >
          
          {/* Flickering candlelight / Moonlight layer overlay */}
          {theme === 'candlelight' && <div className="candle-overlay" />}
          {theme === 'night' && <div className="moonlight-overlay" />}

          {/* Dynamic 3D shadow cast beneath the book */}
          <div 
            className="book-desk-shadow"
            style={{
              width: currentSpread === 0 || currentSpread === totalSpreads ? "440px" : "880px",
              transform: 
                currentSpread === 0 
                  ? "translateX(220px) translateY(12px) rotate(1deg)" 
                  : currentSpread === totalSpreads 
                    ? "translateX(-220px) translateY(12px) rotate(-1deg)" 
                    : "translateX(0px) translateY(12px) rotate(0deg)",
              opacity: theme === 'night' ? 0.9 : theme === 'candlelight' ? 0.82 : 0.75
            }}
          />

          {/* 3D Container viewport with dynamic shift translation */}
          <div 
            className="book-container w-full h-full relative transition-transform"
            style={{
              transform: 
                currentSpread === 0 
                  ? "translateX(-220px)" 
                  : currentSpread === totalSpreads 
                    ? "translateX(220px)" 
                    : "translateX(0px)",
              transitionTimingFunction: "cubic-bezier(0.2, 1, 0.3, 1)",
              transitionDuration: (currentSpread === 0 || currentSpread === 1 || currentSpread === totalSpreads || currentSpread === totalSpreads - 1) ? "850ms" : "650ms"
            }}
          >
            
            {/* Page Stack Edge (visible on the right when closed at front) */}
            {currentSpread === 0 && (
              <div 
                className="absolute right-[2.2%] top-[3.6%] w-[45.8%] h-[92.8%] pointer-events-none rounded-r z-[3]"
                style={{
                  background: `
                    repeating-linear-gradient(to right, 
                      rgba(0,0,0,0.11) 0px, 
                      rgba(0,0,0,0.11) 1px, 
                      transparent 1px, 
                      transparent 3px
                    ),
                    linear-gradient(to right,
                      #fdfbf7 0%,
                      #f6f1e5 8%,
                      #e8e1d0 90%,
                      #cfc4ac 100%
                    )
                  `,
                  boxShadow: "inset 6px 0 10px rgba(0,0,0,0.18), 2px 2px 5px rgba(0,0,0,0.15)"
                }}
              />
            )}

            {/* Page Stack Edge (visible on the left when closed at back) */}
            {currentSpread === totalSpreads && (
              <div 
                className="absolute left-[2.2%] top-[3.6%] w-[45.8%] h-[92.8%] pointer-events-none rounded-l z-[3]"
                style={{
                  background: `
                    repeating-linear-gradient(to left, 
                      rgba(0,0,0,0.11) 0px, 
                      rgba(0,0,0,0.11) 1px, 
                      transparent 1px, 
                      transparent 3px
                    ),
                    linear-gradient(to left,
                      #fdfbf7 0%,
                      #f6f1e5 8%,
                      #e8e1d0 90%,
                      #cfc4ac 100%
                    )
                  `,
                  boxShadow: "inset -6px 0 10px rgba(0,0,0,0.18), -2px 2px 5px rgba(0,0,0,0.15)"
                }}
              />
            )}
            
            {/* 1. LEFT COVER CONTAINER (3D Rotating Board) */}
            <div 
              className={getLeftCoverClass()}
              style={{
                transform: currentSpread === 0 ? "rotateY(180deg)" : "rotateY(0deg)",
                zIndex: getLeftCoverZIndex()
              }}
              onClick={() => {
                if (isFlipping) return;
                if (currentSpread === 0) handleNext();
                else if (currentSpread === 1) handlePrev();
              }}
            >
              {/* BACK SIDE: Outer Front Leather Cover (Redesigned with gold filigree and embossed title) */}
              <div className="cover-board-back leather-grain-bg flex flex-col justify-between items-center text-center text-white p-10 border border-gold/30 rounded-r relative cursor-pointer h-full">
                {/* Gold Frame Ornaments */}
                <div className="gold-corner-accent gold-corner-tl"><div className="gold-corner-inner" /></div>
                <div className="gold-corner-accent gold-corner-tr"><div className="gold-corner-inner" /></div>
                <div className="gold-corner-accent gold-corner-bl"><div className="gold-corner-inner" /></div>
                <div className="gold-corner-accent gold-corner-br"><div className="gold-corner-inner" /></div>
                
                {/* Book Spine shadow element on the right (hinge side of back cover when open, which is the left side of closed cover) */}
                <div className="absolute right-0 top-0 bottom-0 w-[22px] bg-gradient-to-l from-black/65 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute right-[8px] top-0 bottom-0 w-[1px] bg-gold/15" />
                <div className="absolute right-[12px] top-0 bottom-0 w-[2px] bg-black/45" />

                <span className="text-gold uppercase tracking-[0.25em] text-[9px] font-extrabold mt-6 border border-gold/25 px-4 py-1.5 rounded bg-black/20">
                  Heritage Chronicle
                </span>

                <div className="my-auto py-6 px-4 gold-foil-plate rounded bg-black/25 border border-gold/20 backdrop-blur-[2px] max-w-sm w-full relative">
                  <BookOpen size={46} className="text-gold mx-auto mb-4 opacity-95 animate-pulse" />
                  <h2 className="font-serif text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-gold to-amber-400 tracking-wider leading-snug gold-text-embossed">
                    ಮಧುಬನ ಸದಸ್ಯರು
                  </h2>
                  <div className="w-16 h-0.5 bg-gold/55 my-4 mx-auto" />
                  <p className="text-[10px] text-slate-300 italic font-serif max-w-xs leading-relaxed mx-auto">
                    &ldquo;Rooted in History, Growing for Generations.&rdquo;
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1.5 mb-4">
                  <span className="text-gold/90 text-[10px] uppercase tracking-[0.2em] font-bold animate-bounce">
                    Click to Open
                  </span>
                  <div className="w-8 h-0.5 bg-gold/30" />
                </div>
              </div>

              {/* FRONT SIDE: Inner Left Board Lining (Interactive Table of Contents) */}
              <div className={cn(
                "cover-board-front p-8 flex flex-col justify-between text-amber-950 border-r border-amber-900/10 cursor-default relative h-full",
                `stack-depth-left-${currentSpread <= 1 ? 0 : currentSpread === 2 ? 1 : currentSpread === 3 ? 2 : 3}`
              )}>
                <div className="cover-joint-left" />
                
                <div className="w-full text-center border-b border-amber-900/10 pb-4 mt-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-800">Family Ledger</span>
                  <h4 className="font-serif text-lg font-bold text-amber-950 mt-1 tracking-wide">TABLE OF CONTENTS</h4>
                  <div className="w-10 h-[1.5px] bg-amber-700/30 mx-auto mt-2" />
                </div>

                {/* TOC links */}
                <nav className="my-auto py-2 space-y-2.5 w-full max-w-[260px] mx-auto">
                  {chapters.map((ch, idx) => {
                    const targetSpread = Math.floor(idx / 2) + 1;
                    return (
                      <button
                        key={ch.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJumpToSpread(targetSpread);
                        }}
                        className="w-full group flex items-baseline justify-between text-left text-xs font-serif hover:text-gold transition-colors py-1.5 border-b border-dashed border-amber-800/10 cursor-pointer"
                      >
                        <span className="font-medium truncate mr-2 group-hover:translate-x-1 transition-transform">
                          {ch.title.replace(/Chapter \d+:\s*/, "")}
                        </span>
                        <span className="text-slate-400 font-mono text-[9px] flex-shrink-0">p. {idx * 2 + 1}</span>
                      </button>
                    );
                  })}
                  
                  {/* Epilogue link */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJumpToSpread(totalSpreads - 1);
                    }}
                    className="w-full group flex items-baseline justify-between text-left text-xs font-serif hover:text-gold transition-colors py-1.5 border-b border-dashed border-amber-800/10 cursor-pointer"
                  >
                    <span className="font-medium group-hover:translate-x-1 transition-transform">
                      Ancestral Epilogue
                    </span>
                    <span className="text-slate-400 font-mono text-[9px] flex-shrink-0">p. {chapters.length * 2 + 1}</span>
                  </button>
                </nav>

                <div className="text-center text-[9px] text-amber-800/70 font-mono uppercase tracking-widest pt-1 border-t border-amber-900/5">
                  Click Left Hinge to Close
                </div>
              </div>
            </div>

            {/* 2. RIGHT COVER CONTAINER (3D Rotating Board) */}
            <div 
              className={getRightCoverClass()}
              style={{
                transform: currentSpread === totalSpreads ? "rotateY(-180deg)" : "rotateY(0deg)",
                zIndex: getRightCoverZIndex()
              }}
              onClick={() => {
                if (isFlipping) return;
                if (currentSpread === totalSpreads - 1) handleNext();
                else if (currentSpread === totalSpreads) handlePrev();
              }}
            >
              {/* FRONT SIDE: Inner Right Board Lining (Static archives details) */}
              <div className={cn(
                "cover-board-front p-10 flex flex-col justify-between items-center text-center text-amber-950 border-l border-amber-900/10 cursor-default relative h-full",
                `stack-depth-right-${currentSpread <= 1 ? 3 : currentSpread === 2 ? 2 : currentSpread === 3 ? 1 : 0}`
              )}>
                <div className="cover-joint-right" />
                
                <div className="my-auto py-8 text-center max-w-xs mx-auto">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-900 mb-2 block">Mangalore, India</span>
                  <h4 className="font-serif text-xl font-bold text-amber-950 tracking-wider">POOJARI ARCHIVES</h4>
                  <div className="w-12 h-[1px] bg-amber-800 my-4 mx-auto" />
                  <p className="text-[11px] text-amber-800/90 font-serif leading-relaxed text-justify px-3">
                    All historical profiles, migration timelines, and digital assets compiled in this book have been verified and archived under the supervision of the family council.
                  </p>
                  <p className="text-[10px] text-amber-700/60 font-serif italic mt-6">
                    &ldquo;Deeply rooted, growing forever.&rdquo;
                  </p>
                </div>
                
                <span className="text-[9px] text-amber-800/70 font-mono tracking-widest uppercase">
                  Click Right Hinge to Close
                </span>
              </div>

              {/* BACK SIDE: Outer Back Leather Cover (Redesigned with gold filigree and embossed title) */}
              <div className="cover-board-back leather-grain-bg flex flex-col justify-between items-center text-center text-white p-10 border border-gold/30 rounded-l relative cursor-pointer h-full">
                {/* Gold Frame Ornaments */}
                <div className="gold-corner-accent gold-corner-tl"><div className="gold-corner-inner" /></div>
                <div className="gold-corner-accent gold-corner-tr"><div className="gold-corner-inner" /></div>
                <div className="gold-corner-accent gold-corner-bl"><div className="gold-corner-inner" /></div>
                <div className="gold-corner-accent gold-corner-br"><div className="gold-corner-inner" /></div>

                {/* Spine shadow element on the left (hinge side of back cover when folded left) */}
                <div className="absolute left-0 top-0 bottom-0 w-[22px] bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute left-[8px] top-0 bottom-0 w-[1px] bg-gold/15" />
                <div className="absolute left-[12px] top-0 bottom-0 w-[2px] bg-black/45" />

                <span className="text-gold uppercase tracking-[0.25em] text-[9px] font-extrabold mt-6 border border-gold/25 px-4 py-1.5 rounded bg-black/20">
                  Poojari Ledger
                </span>

                <div className="my-auto py-6 px-4 gold-foil-plate rounded bg-black/25 border border-gold/20 backdrop-blur-[2px] max-w-sm w-full relative">
                  <h3 className="font-serif text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-gold to-amber-400 tracking-wider mb-2 gold-text-embossed">
                    POOJARI HERITAGE
                  </h3>
                  <div className="w-10 h-0.5 bg-gold/45 my-3 mx-auto" />
                  <p className="font-serif italic text-slate-300 text-xs">
                    &ldquo;Rooted in History, Growing for Generations&rdquo;
                  </p>
                </div>

                <span className="text-slate-400 text-[9px] mb-4 font-mono tracking-widest uppercase">
                  Poojari Family Council © 2026
                </span>
              </div>
            </div>
            
            {/* Spine Crease Shadows (visible only when the book is open) */}
            <div 
              className={cn(
                "absolute left-1/2 top-0 bottom-0 w-8 bg-gradient-to-r from-black/60 via-transparent to-black/60 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-[950ms]",
                (currentSpread === 0 || currentSpread === totalSpreads) ? "opacity-0" : "opacity-100"
              )}
            />
            <div 
              className={cn(
                "absolute left-1/2 top-0 bottom-0 w-[4px] bg-[#100902] -translate-x-1/2 z-30 pointer-events-none shadow-[0_0_12px_rgba(0,0,0,0.8)] transition-opacity duration-[950ms]",
                (currentSpread === 0 || currentSpread === totalSpreads) ? "opacity-0" : "opacity-100"
              )}
            />
            
            {/* Golden Ribbon Bookmark (Visible only when the book is open, clickable to go to TOC) */}
            {currentSpread > 0 && currentSpread < totalSpreads && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleJumpToSpread(1); // Jump back to Table of Contents
                }}
                className="absolute left-1/2 top-[3%] w-[7px] h-[92%] bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 -translate-x-1/2 z-40 cursor-pointer rounded-b shadow-[1px_4px_8px_rgba(0,0,0,0.6)] transition-all hover:scale-x-125 duration-300 hover:brightness-110 active:brightness-95 animate-fade-in origin-top rotate-1"
                title="Jump to Table of Contents"
              />
            )}

            {/* 3. 3D TURNING SHEETS CONTAINER (Absolutely aligned on the right half) */}
            <div 
              className={cn(
                "absolute right-[2%] top-[3%] w-[48%] h-[94%] select-none transition-opacity duration-500 book-sheets-container",
                (currentSpread === 0 || currentSpread === totalSpreads) ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              {Array.from({ length: totalSheets }).map((_, sheetIdx) => {
                const frontChapter = chapters[sheetIdx * 2];
                const backChapter = chapters[sheetIdx * 2 + 1];
                const isLastSheet = sheetIdx === totalSheets - 1;

                return (
                  <div 
                    key={sheetIdx}
                    className={cn(
                      "book-page", 
                      currentSpread > sheetIdx + 1 && "flipped",
                      isFlipping && flippingSheet === sheetIdx && (direction === 'next' ? 'turning-next' : 'turning-prev')
                    )}
                    style={{ zIndex: isFlipping && flippingSheet === sheetIdx ? 50 : 10 + getSheetZIndex(sheetIdx) }}
                    onClick={() => {
                      if (currentSpread === sheetIdx + 1) handleNext();
                      else if (currentSpread === sheetIdx + 2) handlePrev();
                    }}
                  >
                    {/* Page shadow sweeps during flip */}
                    {isFlipping && flippingSheet === sheetIdx && (
                      <div className={direction === 'next' ? 'shadow-sweep-next' : 'shadow-sweep-prev'} />
                    )}

                    {/* FRONT PAGE */}
                    <div className="book-page-front bg-[#fcf8f0] p-10 flex flex-col justify-between text-amber-950 rounded-r cursor-pointer relative h-full select-none">
                      <div className="page-glare" />
                      <div className="flex flex-col h-full justify-between">
                        {frontChapter ? (
                          <>
                            <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                              <span className="text-[9px] uppercase tracking-widest text-amber-800/70 font-mono font-bold">
                                {frontChapter.title.split(":")[0] || `Chapter ${frontChapter.chapter}`}
                              </span>
                              <BookOpen size={12} className="text-amber-800/40" />
                            </div>
                            
                            {/* Content render with vintage Drop Cap */}
                            <div className="my-auto py-4">
                              {renderTextContent(frontChapter.content)}
                            </div>
                          </>
                        ) : (
                          <div className="my-auto text-center text-slate-400 italic font-serif">Page is empty</div>
                        )}
                        
                        <div className="flex justify-between items-end border-t border-amber-900/5 pt-2">
                          <span className="text-[9px] text-amber-800 font-bold font-mono">Page {sheetIdx * 2 + 1}</span>
                          <span className="text-[9px] text-amber-800/50 font-mono tracking-widest uppercase hover:text-gold transition-colors">Click to turn</span>
                        </div>
                      </div>
                    </div>

                    {/* BACK PAGE */}
                    <div className="book-page-back bg-[#fcf8f0] p-10 flex flex-col justify-between text-amber-950 rounded-l cursor-pointer border-r border-amber-900/10 relative h-full select-none">
                      <div className="page-glare" />
                      <div className="flex flex-col h-full justify-between">
                        {isLastSheet ? (
                          <div className="flex flex-col h-full justify-between py-2">
                            <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                              <span className="text-[9px] uppercase tracking-widest text-amber-800/70 font-mono font-bold">
                                Epilogue
                              </span>
                              <Sparkles size={12} className="text-amber-800/40" />
                            </div>

                            <div className="my-auto text-center space-y-4 px-2">
                              <h4 className="font-serif text-sm font-semibold italic text-amber-950 leading-relaxed px-4 text-justify">
                                &ldquo;To know where you are going, you must first remember where you came from.&rdquo;
                              </h4>
                              <div className="w-12 h-0.5 bg-amber-700/30 mx-auto" />
                              <p className="text-[11px] leading-relaxed text-amber-800/90 font-serif text-justify">
                                This digital chronicle serves as a living ledger of the Poojari family. It records our agricultural origins in Mangalore and our journey across generations.
                              </p>
                            </div>
                          </div>
                        ) : backChapter ? (
                          <>
                            <div className="flex items-center justify-between border-b border-amber-900/10 pb-2.5">
                              <span className="text-[9px] uppercase tracking-widest text-amber-800/70 font-mono font-bold">
                                {backChapter.title.split(":")[0] || `Chapter ${backChapter.chapter}`}
                              </span>
                              <BookOpen size={12} className="text-amber-800/40" />
                            </div>
                            
                            {/* Content render with vintage Drop Cap */}
                            <div className="my-auto py-4">
                              {renderTextContent(backChapter.content)}
                            </div>
                          </>
                        ) : (
                          <div className="my-auto text-center text-slate-400 italic font-serif">Page is empty</div>
                        )}
                        
                        <div className="flex justify-between items-end border-t border-amber-900/5 pt-2">
                          <span className="text-[9px] text-amber-800/50 font-mono tracking-widest uppercase hover:text-gold transition-colors">Click to turn back</span>
                          <span className="text-[9px] text-amber-800 font-bold font-mono">Page {sheetIdx * 2 + 2}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

    {scale < 0.85 && (
      <div className="text-[11px] text-amber-200/50 font-serif italic mt-2 text-center animate-pulse px-4">
        Tip: Rotate your device to landscape for a larger, more detailed reading view!
      </div>
    )}

    {/* Buttons Controls */}
    <div className="flex items-center gap-6 mt-6">
      <button
        onClick={handlePrev}
        disabled={currentSpread === 0 || isFlipping}
        className="p-3 bg-slate-900 hover:bg-gold text-slate-300 hover:text-black rounded-full border border-white/10 hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
      >
        <ChevronLeft size={20} />
      </button>
      
      <span className="text-xs text-slate-400 font-mono tracking-widest uppercase bg-slate-950/50 border border-white/5 px-4 py-2 rounded-full">
        {currentSpread === 0 ? "Front Cover" : currentSpread === totalSpreads ? "Back Cover" : `Spread ${currentSpread} / ${totalSpreads - 1}`}
      </span>
      
      <button
        onClick={handleNext}
        disabled={currentSpread === totalSpreads || isFlipping}
        className="p-3 bg-slate-900 hover:bg-gold text-slate-300 hover:text-black rounded-full border border-white/10 hover:border-gold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
      >
        <ChevronRight size={20} />
      </button>
    </div>

  </div>



    </div>
  );
}
