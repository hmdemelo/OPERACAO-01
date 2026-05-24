"use client"

import Link from "next/link"
import { useCookieConsent } from "@/lib/cookieConsent"

export function CookieBanner() {
    const { state, accept, reject } = useCookieConsent()

    if (state !== "pending") return null

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label="Aviso de cookies"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-md shadow-2xl"
        >
            <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 text-sm text-slate-300 leading-relaxed">
                    <p>
                        Usamos cookies e pixels de rastreamento para analisar o desempenho e personalizar o
                        conteúdo. Nenhum script de marketing é executado antes do seu aceite explícito.{" "}
                        <Link
                            href="/privacidade"
                            className="text-orange-500 underline-offset-2 hover:underline whitespace-nowrap"
                        >
                            Saiba mais
                        </Link>
                        .
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={reject}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Recusar
                    </button>
                    <button
                        type="button"
                        onClick={accept}
                        className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-slate-950 bg-orange-500 rounded-lg hover:bg-orange-400 transition-colors"
                    >
                        Aceitar
                    </button>
                </div>
            </div>
        </div>
    )
}
