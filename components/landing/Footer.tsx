"use client"

import React from 'react';
import { Instagram, Youtube } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
    config: {
        instagramUrl: string;
        youtubeUrl: string;
    };
}

export const Footer = ({ config }: FooterProps) => {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-20 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Logo size="sm" />
                        <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Operação 01</span>
                    </div>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center md:text-left">
                        © {new Date().getFullYear()} Operação 01 • Mentoria de Elite • Todos os direitos reservados
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {config.instagramUrl && (
                        <a
                            href={config.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/5 p-4 rounded-2xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all active:scale-90"
                            title="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                    )}
                    {config.youtubeUrl && (
                        <a
                            href={config.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/5 p-4 rounded-2xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all active:scale-90"
                            title="YouTube"
                        >
                            <Youtube size={20} />
                        </a>
                    )}
                </div>
            </div>
        </footer>
    );
};
