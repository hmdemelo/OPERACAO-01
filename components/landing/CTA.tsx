"use client"

import React from 'react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

export const CTA = () => {
    const handleWhatsAppRedirect = (message: string) => {
        const link = generateWhatsAppLink(message);
        window.open(link, '_blank');
    };

    return (
        <section className="py-40 px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">Missão dada é <span className="text-orange-500">Missão Cumprida</span></h2>
                <p className="text-slate-400 text-lg">O próximo aprovado pode ser você. Não deixe para amanhã o estudo que te fará 01.</p>
                <button
                    onClick={() => handleWhatsAppRedirect("Olá! Quero ser Operação 01 e iniciar meu treinamento agora!")}
                    className="bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-sm px-16 py-8 rounded-[2rem] hover:bg-orange-700 shadow-[0_30px_60px_rgba(234,88,12,0.3)] transition-all active:scale-95"
                >
                    Quero ser Operação 01
                </button>
            </div>
        </section>
    );
};
