"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, FastForward, Rewind, Volume2 } from "lucide-react";

interface OriginalPodcastPlayerProps {
  audioUrl: string;
  titulo: string;
}

export default function PodcastPlayer({ audioUrl, titulo }: OriginalPodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalTime(formatTime(audioRef.current.duration));
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border-l-[6px] border-red-700 max-w-2xl mx-auto my-8">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex flex-col gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-1 block">Ouvindo Agora</span>
          <h3 className="text-xl font-black tracking-tight leading-tight">{titulo}</h3>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-700"
          />
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>{currentTime}</span>
            <span>{totalTime}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button className="text-slate-400 hover:text-white transition-colors" title="Retroceder 15s" 
            onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 15; }}>
            <Rewind className="w-6 h-6" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white ml-1" />
            )}
          </button>

          <button className="text-slate-400 hover:text-white transition-colors" title="Avançar 15s"
            onClick={() => { if(audioRef.current) audioRef.current.currentTime += 15; }}>
            <FastForward className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
           <Volume2 className="w-4 h-4" />
           <span>Áudio Original Revista Gestão</span>
        </div>
      </div>
    </div>
  );
}
