"use client"

import React from 'react';

type LogoProps = {
    size?: "sm" | "md" | "lg";
    light?: boolean;
};

export const Logo = ({ size = "md", light = false }: LogoProps) => {
    const dimensions = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-24 w-24" : "h-14 w-14";
    const fontSize = size === "sm" ? "text-xs" : size === "lg" ? "text-4xl" : "text-xl";

    return (
        <div className={`relative ${dimensions} flex items-center justify-center shrink-0`}>
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin [animation-duration:3s]"></div>
            <div className={`relative ${light ? 'bg-white' : 'bg-slate-900'} rounded-full w-[85%] h-[85%] flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-slate-800`}>
                <span className={`${fontSize} font-black ${light ? 'text-slate-900' : 'text-white'} tracking-tighter italic`}>01</span>
            </div>
        </div>
    );
};
