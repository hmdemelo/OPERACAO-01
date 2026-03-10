"use client"

import { FeaturedStudent, MethodItem } from "@prisma/client";
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Method } from './Method';
import { FeaturedStudents } from './FeaturedStudents';
import { Plans } from './Plans';
import { CTA } from './CTA';
import { Footer } from './Footer';

interface LandingPageProps {
    featuredStudents: FeaturedStudent[];
    methodItems: MethodItem[];
    plans: any[];
    config: {
        heroTitle: string;
        heroSubtitle: string;
        heroVideoUrl: string;
        ctaTitle: string;
        ctaButtonText: string;
        whatsappNumber: string;
        whatsappMessage: string;
        instagramUrl: string;
        youtubeUrl: string;
        fbPixelId: string;
        gtmId: string;
    };
}

export function LandingPage({ featuredStudents, methodItems, plans, config }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 font-sans">
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <Navbar />

            <main className="relative">
                <Hero config={config} />
                <Method items={methodItems} />
                <FeaturedStudents students={featuredStudents} />
                <Plans plans={plans} whatsappNumber={config.whatsappNumber} whatsappMessage={config.whatsappMessage} />
                <CTA config={config} />
            </main>

            <Footer config={config} />
        </div>
    );
}
