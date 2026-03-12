import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";

export default function DialogoApresentacao({ dialogo, onClose }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const autoTimer = useRef(null);

  const slides = dialogo.slides_ia || [];
  const total = slides.length;
  const current = slides[slideIndex];

  const stopSpeech = useCallback(() => {
    synthRef.current.cancel();
    setSpeaking(false);
  }, []);

  const speakSlide = useCallback((slide) => {
    if (muted || !slide) return;
    stopSpeech();
    const utter = new SpeechSynthesisUtterance(`${slide.titulo}. ${slide.texto}`);
    utter.lang = "pt-BR";
    utter.rate = 0.95;
    utter.pitch = 1;
    const voices = synthRef.current.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt"));
    if (ptVoice) utter.voice = ptVoice;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => {
      setSpeaking(false);
      if (playing) {
        autoTimer.current = setTimeout(() => {
          setSlideIndex(i => {
            if (i < total - 1) return i + 1;
            setPlaying(false);
            return i;
          });
        }, 800);
      }
    };
    synthRef.current.speak(utter);
  }, [muted, playing, total, stopSpeech]);

  useEffect(() => {
    if (playing) speakSlide(current);
  }, [slideIndex, playing]);

  useEffect(() => {
    return () => { stopSpeech(); clearTimeout(autoTimer.current); };
  }, [stopSpeech]);

  const handlePlay = () => {
    if (playing) { setPlaying(false); stopSpeech(); clearTimeout(autoTimer.current); }
    else { setPlaying(true); speakSlide(current); }
  };

  const goTo = (i) => {
    stopSpeech(); clearTimeout(autoTimer.current);
    setSlideIndex(i);
    if (playing) setTimeout(() => speakSlide(slides[i]), 100);
  };

  const restart = () => { stopSpeech(); clearTimeout(autoTimer.current); setSlideIndex(0); setPlaying(false); };

  const bgGradients = [
    "from-blue-900 to-blue-700", "from-slate-900 to-slate-700",
    "from-green-900 to-green-700", "from-purple-900 to-purple-700",
    "from-red-900 to-red-700", "from-orange-900 to-orange-700",
  ];
  const bg = bgGradients[slideIndex % bgGradients.length];

  if (total === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 text-white z-10">
        <span className="text-xs font-medium text-white/70 truncate max-w-[60%]">{dialogo.titulo}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">{slideIndex + 1} / {total}</span>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Slide */}
      <div className={`flex-1 bg-gradient-to-br ${bg} relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-12`}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
          <motion.div className="h-full bg-white" animate={{ width: `${((slideIndex + 1) / total) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Speaking indicator */}
        {speaking && (
          <div className="absolute top-3 right-3 flex gap-1 items-end h-5">
            {[0, 1, 2, 3].map(i => (
              <motion.div key={i} className="w-1 bg-white rounded-full"
                animate={{ height: ["4px", "16px", "4px"] }}
                transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={slideIndex}
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            className="text-center max-w-2xl w-full">
            <div className="text-6xl mb-6">{current.emoji || "📋"}</div>
            <h2 className="text-white text-2xl md:text-4xl font-bold mb-6 leading-tight">{current.titulo}</h2>
            <p className="text-white/85 text-base md:text-xl leading-relaxed">{current.texto}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="absolute bottom-6 flex gap-1.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`rounded-full transition-all ${i === slideIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/90 px-4 py-3 flex items-center justify-between gap-3">
        <button onClick={restart} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => goTo(Math.max(0, slideIndex - 1))} disabled={slideIndex === 0}
            className="p-2 hover:bg-white/10 rounded-lg text-white disabled:opacity-30">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-[#0066b1] hover:bg-[#0055a0] flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button onClick={() => goTo(Math.min(total - 1, slideIndex + 1))} disabled={slideIndex === total - 1}
            className="p-2 hover:bg-white/10 rounded-lg text-white disabled:opacity-30">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => { setMuted(m => !m); if (!muted) stopSpeech(); }}
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}