"use client"

import React from 'react';
import { Logo } from './Logo';

export const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-12 px-6 text-center">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                    <Logo size="sm" />
                    <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Operação 01</span>
                </div>
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                    © 2024 Operação 01 • Mentoria de Elite • Todos os direitos reservados
                </p>
            </div>
        </footer>
    );
};
