"use client"

import React from 'react';
import { Compass, PenTool, Target, Trophy, Zap, Map, Shield, Sword, Crosshair, Flag, BookOpen, Brain, Activity } from 'lucide-react';

interface MethodItem {
    id?: string;
    step: string;
    title: string;
    description: string;
    icon: string;
}

interface MethodProps {
    items?: MethodItem[];
}

const IconMap: Record<string, any> = {
    Compass, PenTool, Target, Trophy, Map, Shield, Sword, Crosshair, Flag, BookOpen, Brain, Activity
};

export const Method = ({ items }: MethodProps) => {
    const defaultItems: MethodItem[] = [
        {
            step: "01",
            icon: "Compass",
            title: "Diagnóstico Tático",
            description: "Identificamos seus pontos fracos através de um simulado nivelador para traçar sua rota de combate."
        },
        {
            step: "02",
            icon: "PenTool",
            title: "Plano de Operações",
            description: "Cronograma personalizado focado em horas líquidas e ciclo de matérias otimizado."
        },
        {
            step: "03",
            icon: "Target",
            title: "Execução & Registro",
            description: "Você registra cada minuto e questão no nosso terminal. Dados que geram evolução real."
        },
        {
            step: "04",
            icon: "Trophy",
            title: "Revisão e Vitória",
            description: "Ajustes semanais com o mentor Weverson baseados no seu ranking e métricas de acerto."
        }
    ];

    const displayItems = (items && items.length > 0) ? items : defaultItems;

    return (
        <section id="metodo" className="py-32 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Engenharia da Aprovação</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">O Método Operação 01</h3>
                </div>

                <div className="grid lg:grid-cols-4 gap-4">
                    {displayItems.map((item, i) => {
                        const IconComponent = IconMap[item.icon] || Compass;
                        // Color logic based on existing design or dynamic?
                        // The original design had specific colors for specific items (orange, blue, red, amber).
                        // If dynamic, we lose that specific color mapping unless we add color to DB or cycle through them.
                        // Let's cycle through them.
                        const colors = ["text-orange-500", "text-blue-500", "text-red-500", "text-amber-500", "text-emerald-500", "text-purple-500"];
                        const colorClass = colors[i % colors.length];

                        return (
                            <div key={i} className="group bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
                                        <IconComponent size={32} className={colorClass} />
                                    </div>
                                    <span className="text-4xl font-black text-white/10 group-hover:text-orange-500/20 transition-colors italic">{item.step}</span>
                                </div>
                                <h4 className="text-xl font-black text-white uppercase mb-4 tracking-tight">{item.title}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 bg-gradient-to-r from-orange-600 to-orange-800 rounded-[3rem] p-12 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform">
                        <Zap size={200} fill="white" />
                    </div>
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Por que o método funciona?</h4>
                            <p className="text-white/80 font-medium">Não acreditamos em fórmulas mágicas. Acreditamos em **Dados, Disciplina e Direcionamento**. Nosso software exclusivo gera insights que uma planilha comum jamais conseguiria.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                <p className="text-2xl font-black text-white">40%</p>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">Mais agilidade</p>
                            </div>
                            <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                <p className="text-2xl font-black text-white">+85%</p>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1">De retenção</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
