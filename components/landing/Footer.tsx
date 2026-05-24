"use client"

import React from 'react';
import Link from 'next/link';
import { Instagram, Youtube } from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
    config: {
        instagramUrl?: string;
        youtubeUrl?: string;
    };
}

export const Footer = ({ config }: FooterProps) => {
    return (
        <footer className="bg-slate-950 border-t border-white/5 py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {/* Coluna 1 — Marca */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Logo size="sm" />
                        <span className="text-white font-black uppercase tracking-[0.2em] text-sm">Operação 01</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed text-center md:text-left">
                        Mentoria de Elite para concursos públicos.
                    </p>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center md:text-left">
                        © {new Date().getFullYear()} Operação 01 • Todos os direitos reservados
                    </p>
                </div>

                {/* Coluna 2 — Legal */}
                <div className="space-y-3 text-center md:text-left">
                    <h3 className="text-white text-[10px] font-black uppercase tracking-widest">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link
                                href="/privacidade"
                                className="text-slate-400 hover:text-orange-500 transition-colors"
                            >
                                Política de Privacidade
                            </Link>
                        </li>
                        <li>
                            <Link href="/termos" className="text-slate-400 hover:text-orange-500 transition-colors">
                                Termos de Uso
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Coluna 3 — Contato e redes */}
                <div className="space-y-4 text-center md:text-left">
                    <h3 className="text-white text-[10px] font-black uppercase tracking-widest">Contato</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a
                                href="mailto:privacidade@operacao01.com.br"
                                className="text-slate-400 hover:text-orange-500 transition-colors break-all"
                            >
                                privacidade@operacao01.com.br
                            </a>
                            <p className="text-slate-600 text-[10px] uppercase tracking-widest mt-0.5">
                                Encarregado de dados (DPO)
                            </p>
                        </li>
                    </ul>
                    <div className="flex items-center gap-3 justify-center md:justify-start pt-2">
                        {config.instagramUrl && (
                            <a
                                href={config.instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white/5 p-3 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all active:scale-90"
                                title="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                        )}
                        {config.youtubeUrl && (
                            <a
                                href={config.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white/5 p-3 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all active:scale-90"
                                title="YouTube"
                            >
                                <Youtube size={18} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
};
