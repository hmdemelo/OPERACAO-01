"use client"

import React from 'react';
import { FeaturedStudent } from "@prisma/client";

interface FeaturedStudentsProps {
    students: FeaturedStudent[];
}

export const FeaturedStudents = ({ students }: FeaturedStudentsProps) => {
    return (
        <section id="aprovados" className="py-32 px-6 bg-slate-900/20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <div className="space-y-4">
                        <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Mural da Glória</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Legado Operação 01</h3>
                    </div>
                    <p className="text-slate-400 max-w-md text-sm font-medium">
                        Estes são alguns dos agentes que seguiram o método à risca e hoje ostentam o distintivo no peito. Sua foto será a próxima.
                    </p>
                </div>

                {students.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                        <p>Nenhum aprovado em destaque no momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {students.map((res) => (
                            <div key={res.id} className="group bg-slate-900 border border-white/5 rounded-[2.5rem] p-2 hover:border-orange-500/30 transition-all overflow-hidden">
                                <div className="relative h-96 rounded-[2.2rem] overflow-hidden">
                                    <img src={res.imageUrl} alt={res.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-xl font-black text-white uppercase tracking-tighter mb-3">{res.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {res.role.split('\n').map((role, idx) => (
                                                <span key={idx} className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 backdrop-blur-sm">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-400 text-sm italic font-medium leading-relaxed">"{res.quote}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};
