"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, Loader2 } from "lucide-react";
import { extractPlainTextFromHtml, splitTextIntoChunks } from "@/lib/tts-utils";

interface TTSPlayerProps {
  htmlContent: string;
  title: string;
}

export default function TTSPlayer({ htmlContent, title }: TTSPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunks, setChunks] = useState<string[]>([]);

  const synth = mounted ? window.speechSynthesis : null;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prepara o texto quando o conteúdo muda
  useEffect(() => {
    const plainText = `${title}. ${extractPlainTextFromHtml(htmlContent)}`;
    // Aumentamos o tamanho de cada bloco para 600 caracteres para uma leitura mais fluida
    setChunks(splitTextIntoChunks(plainText, 600));
  }, [htmlContent, title]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  const speak = (index: number) => {
    if (!synth || index >= chunks.length || !isPlaying) return;

    // Cancela qualquer fala anterior para evitar sobreposição
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = "pt-BR";
    utterance.rate = 1.0;
    
    // Tenta encontrar uma voz em português brasileiro de qualidade
    const voices = synth.getVoices();
    const ptVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt_BR"));
    if (ptVoice) utterance.voice = ptVoice;

    utterance.onstart = () => {
      setIsLoading(false);
    };

    utterance.onend = () => {
      if (index + 1 < chunks.length) {
        setCurrentChunkIndex(index + 1);
      } else {
        setIsPlaying(false);
        setCurrentChunkIndex(0);
      }
    };

    utterance.onerror = (event) => {
      console.error("TTS Error:", event);
      if (event.error !== "interrupted") {
        setIsPlaying(false);
      }
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
  };

  // Trigger para tocar o próximo bloco quando o index muda
  useEffect(() => {
    if (isPlaying && !isPaused) {
      speak(currentChunkIndex);
    }
  }, [currentChunkIndex, isPlaying, isPaused]);

  const handlePlay = () => {
    if (!synth) return;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      setIsLoading(true);
      setIsPlaying(true);
      setCurrentChunkIndex(0);
      // O useEffect cuidará de chamar o speak(0)
    }
  };

  const handlePause = () => {
    if (!synth) return;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!synth) return;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  };

  if (!mounted || !synth) return null;

  return (
    <div className="my-8 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 border-l-4 border-red-700 rounded-r-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all group overflow-hidden relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-red-700 text-white rounded-full flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Ouvir Notícia
            {isPlaying && (
              <span className="flex gap-0.5 items-end h-3 mb-0.5">
                <span className="w-0.5 h-full bg-red-600 animate-[bounce_0.6s_infinite_0s]"></span>
                <span className="w-0.5 h-2/3 bg-red-600 animate-[bounce_0.6s_infinite_0.2s]"></span>
                <span className="w-0.5 h-full bg-red-600 animate-[bounce_0.6s_infinite_0.4s]"></span>
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-350 dark:text-gray-400 font-medium">
            {isPlaying 
              ? `Lendo bloco ${currentChunkIndex + 1} de ${chunks.length}` 
              : isPaused ? "Leitura pausada" : "Escute a matéria completa por síntese de voz"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-850 p-1.5 rounded-full shadow-inner border border-gray-200 dark:border-gray-800">
        {!isPlaying ? (
          <button 
            onClick={handlePlay}
            disabled={isLoading}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter transition-all disabled:opacity-50"
            aria-label="Play"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            Ouvir
          </button>
        ) : (
          <button 
            onClick={handlePause}
            className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter transition-all"
            aria-label="Pause"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pausar
          </button>
        )}
        
        {(isPlaying || isPaused) && (
          <button 
            onClick={handleStop}
            className="p-2.5 text-gray-500 hover:text-red-700 transition-colors"
            title="Parar"
            aria-label="Stop"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        )}
      </div>

      {/* Progress Bar (Visual Only) */}
      {chunks.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800">
          <div 
            className="h-full bg-red-700 transition-all duration-500" 
            style={{ width: `${((currentChunkIndex) / chunks.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
