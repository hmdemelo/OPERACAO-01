"use client"

import { logger } from "@/lib/logger";
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/whatsapp';

type Plan = {
    id: string
    title: string
    description: string
    price: number
    oldPrice?: number
    installments?: string
    features: string[]
    whatsappMessage?: string
    highlighted: boolean
}

export const Plans = () => {
    const [plans, setPlans] = useState<Plan[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/admin/landing/plans')
                if (res.ok) {
                    const data = await res.json()
                    setPlans(data.filter((p: any) => p.active !== false)) // Filter active only just in case API returns all
                }
            } catch (error) {
                logger.error("Failed to fetch plans", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlans()
    }, [])

    const handleWhatsAppRedirect = (message: string) => {
        const link = generateWhatsAppLink(message);
        window.open(link, '_blank');
    };

    if (isLoading) return <div className="py-32 text-center text-white">Carregando planos...</div>
    if (plans.length === 0) return null

    return (
        <section id="planos" className="py-32 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Seu Alistamento</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Invista no seu futuro</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`
                                ${plan.highlighted
                                    ? "bg-slate-900 border-2 border-orange-600 shadow-[0_40px_80px_rgba(234,88,12,0.15)] scale-105 z-10"
                                    : "bg-slate-900/50 border border-white/5 hover:border-white/10"
                                } 
                                rounded-[3rem] p-12 flex flex-col transition-all relative
                            `}
                        >
                            {plan.highlighted && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 px-8 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em]">
                                    Oferta de Elite
                                </div>
                            )}

                            <div className="mb-10">
                                <h4 className="text-2xl font-black text-white uppercase tracking-tight">{plan.title}</h4>
                                <p className={`${plan.highlighted ? "text-orange-500" : "text-slate-500"} text-[10px] font-black uppercase tracking-widest mt-1`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-10">
                                {plan.oldPrice && (
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest line-through mb-1">
                                        De R$ {plan.oldPrice.toFixed(2)}
                                    </p>
                                )}
                                <div className="flex items-baseline gap-1">
                                    <span className={`${plan.highlighted ? "text-orange-500" : "text-slate-400"} text-sm font-bold uppercase`}>R$</span>
                                    <span className="text-6xl font-black text-white">{Math.floor(plan.price)}</span>
                                    <span className={`${plan.highlighted ? "text-orange-500" : "text-slate-400"} text-sm font-bold uppercase`}>,{(plan.price % 1).toFixed(2).split('.')[1]}</span>
                                </div>
                                {plan.installments && <p className="text-slate-500 text-[10px] font-bold uppercase mt-2">{plan.installments}</p>}
                            </div>

                            <div className="flex-1 space-y-5">
                                {plan.features.map((item, i) => (
                                    <div key={i} className={`flex items-center gap-3 text-xs ${plan.highlighted ? "font-black text-slate-200" : "font-bold text-slate-400"} uppercase tracking-tight`}>
                                        {plan.highlighted
                                            ? <Zap size={16} className="text-orange-500 shrink-0" fill="currentColor" />
                                            : <CheckCircle2 size={16} className="text-orange-500 shrink-0" />
                                        }
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleWhatsAppRedirect(plan.whatsappMessage || `Olá! Tenho interesse no plano ${plan.title}`)}
                                className={`
                                    mt-12 w-full py-5 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all
                                    ${plan.highlighted
                                        ? "bg-orange-600 text-white shadow-xl shadow-orange-900/40 hover:bg-orange-700 py-6 text-xs"
                                        : "bg-white/5 border border-white/10 text-white hover:bg-orange-600"
                                    }
                                `}
                            >
                                {plan.highlighted ? "Garantir Combo de Elite" : "Iniciar Alistamento"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
