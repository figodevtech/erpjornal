"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShortVideoCardProps {
  video: {
    id: string;
    titulo: string;
    video_url: string;
    capa_url?: string | null;
    descricao?: string | null;
    duracao?: number | null;
  };
}

export default function ShortVideoCard({ video }: ShortVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videoElem = videoRef.current;
    if (!videoElem) return;

    const handleTimeUpdate = () => {
      setProgress((videoElem.currentTime / videoElem.duration) * 100);
    };

    videoElem.addEventListener("timeupdate", handleTimeUpdate);
    return () => videoElem.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative group h-[500px] w-full md:w-[280px] bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border-2 border-slate-100/10 shrink-0"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.capa_url || undefined}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Overlays */}
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-24 pointer-events-none">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest bg-red-700 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> News
          </span>
          {video.duracao && (
            <span className="text-[10px] font-black text-slate-300 flex items-center gap-1 uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" /> {video.duracao}s
            </span>
          )}
        </div>
        <h3 className="text-white font-black text-lg leading-tight tracking-tight mb-2 drop-shadow-md uppercase">
           {video.titulo}
        </h3>
        {video.descricao && (
          <p className="text-slate-300 text-xs line-clamp-2 font-medium opacity-90 leading-relaxed">
            {video.descricao}
          </p>
        )}
      </div>

      {/* Interactable Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex gap-4 pointer-events-auto"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 shadow-xl"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Single Line Progress Bar at the very bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div 
           className="h-full bg-red-700 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(185,28,28,0.5)]"
           style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
