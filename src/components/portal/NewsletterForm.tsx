"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface NewsletterFormProps {
  variant?: "inline" | "box";
  origem: string;
}

export default function NewsletterForm({ variant = "box", origem }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origem }),
      });

      if (!res.ok) throw new Error();

      setSubscribed(true);
      toast.success("Inscrição realizada com sucesso!");
    } catch (err) {
      toast.error("Erro ao realizar inscrição. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center p-8 bg-green-50 rounded-[32px] border-2 border-green-100 text-green-800 gap-4"
      >
        <CheckCircle2 className="w-8 h-8 text-green-600" />
        <div>
          <h4 className="font-black text-lg">Você está dentro!</h4>
          <p className="text-sm font-medium opacity-80">Em breve você receberá nossas melhores análises.</p>
        </div>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
       <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
         <div className="relative flex-1">
            <input 
              type="email" 
              required
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-6 rounded-full bg-white border-2 border-slate-100 focus:border-red-700 outline-none font-medium transition-all"
            />
         </div>
         <button 
           type="submit"
           disabled={loading}
           className="h-12 px-8 bg-red-700 text-white rounded-full font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
         >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Entrar</>}
         </button>
       </form>
    );
  }

  return (
    <div className="bg-slate-900 dark:bg-slate-900/40 rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl border-l-[8px] border-red-700 transition-colors">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-700/20 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Exclusivo Revista Gestão</span>
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-white dark:text-slate-50 tracking-tighter mb-4 leading-none uppercase">
          A política antes de virar <span className="text-red-700">notícia</span>.
        </h3>
        <p className="text-slate-200 dark:text-slate-300 text-lg mb-8 max-w-lg font-medium">
          Receba bastidores exclusivos e análises profundas no seu e-mail toda manhã.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl">
          <div className="flex-1">
            <input 
              type="email" 
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-8 rounded-2xl bg-white/5 border-2 border-white/10 text-white placeholder:text-slate-500 focus:border-red-700 outline-none font-bold transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="h-14 px-10 bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Inscrever</>}
          </button>
        </form>
        
        <p className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-red-600" /> Sem spam. Apenas política levada a sério.
        </p>
      </div>
    </div>
  );
}
