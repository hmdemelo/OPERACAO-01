"use client"

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl z-50 border-b border-white/5 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Logo size="sm" />
                    <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Operação 01</span>
                </div>

                <Link href="/signin">
                    <button
                        className="group relative px-6 py-2.5 bg-orange-600 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <span className="relative text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
                            Área do Aluno <ArrowRight size={14} />
                        </span>
                    </button>
                </Link>
            </div>
        </nav>
    );
};
