"use client"

import React from 'react';
import { Zap } from 'lucide-react';
import { Logo } from './Logo';

export const Hero = () => {
    return (
        <section className="pt-40 pb-20 px-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        <Zap size={14} fill="currentColor" />
                        Sua aprovação é nossa única missão
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                        Domine o <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Campo de Batalha</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
                        Pare de estudar sem estratégia. A Operação 01 é o centro de inteligência que transforma esforço em aprovação através de dados e disciplina de elite.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-white text-slate-950 font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                        >
                            Ver Planos Operacionais
                        </button>
                    </div>
                </div>

                <div className="relative group flex justify-center lg:justify-end">
                    <div className="absolute inset-0 bg-orange-600/10 blur-[100px] rounded-full group-hover:bg-orange-600/20 transition-colors"></div>
                    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 shadow-2xl w-full max-w-md flex flex-col items-center gap-8">
                        <Logo size="lg" />
                        <div className="w-full space-y-4">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-600 w-3/4 animate-[shimmer_2s_infinite]"></div>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500">
                                <span>Eficiência da Tropa</span>
                                <span className="text-orange-500">92% de Foco</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
