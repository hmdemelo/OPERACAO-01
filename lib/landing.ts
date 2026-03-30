
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";

export async function getFeaturedStudents() {
    try {
        const students = await prisma.featuredStudent.findMany({
            where: { active: true },
            orderBy: { order: "asc" }
        });
        return students;
    } catch (error) {
        logger.error("Failed to fetch featured students:", error);
        return [];
    }
}

export async function getMethodItems() {
    try {
        const items = await prisma.methodItem.findMany({
            where: { active: true },
            orderBy: { order: "asc" }
        });
        return items;
    } catch (error) {
        logger.error("Failed to fetch method items:", error);
        return [];
    }
}

export async function getPlans() {
    try {
        const plans = await prisma.plan.findMany({
            where: { active: true },
            orderBy: { order: "asc" }
        });
        return plans;
    } catch (error) {
        logger.error("Failed to fetch plans:", error);
        return [];
    }
}

export async function getLandingConfig() {
    try {
        const settings = await prisma.systemSettings.findMany();
        const config: Record<string, string> = {};

        settings.forEach(s => {
            config[s.key] = s.value;
        });

        return {
            heroTitle: config.landing_hero_title || "DOMINE CADA EDITAL",
            heroSubtitle: config.landing_hero_subtitle || "A mentoria que transforma seu esforço em nome no Diário Oficial. Do zero à aprovação com o Método Operação 01.",
            heroBadgeText: config.landing_hero_badge_text || "🔥 VAGAS LIMITADAS",
            heroPrimaryCtaText: config.landing_hero_primary_cta_text || "QUERO SER APROVADO",
            heroSecondaryCtaText: config.landing_hero_secondary_cta_text || "VER PLANOS",
            heroTrustBar: config.landing_hero_trust_bar || "Mais de 1.000 alunos aprovados.",
            
            plansTitle: config.landing_plans_title || "PLANOS DE ALISTAMENTO",
            plansSubtitle: config.landing_plans_subtitle || "Escolha o plano ideal para a sua aprovação.",
            
            featuredTitle: config.landing_featured_title || "MURAL DA GLÓRIA",
            featuredSubtitle: config.landing_featured_subtitle || "Eles confiaram no método e hoje estão fardados.",
            
            methodTitle: config.landing_method_title || "MÉTODO OPERAÇÃO 01",
            methodSubtitle: config.landing_method_subtitle || "O passo a passo testado e aprovado para sua nomeação.",
            
            ctaTitle: config.landing_cta_title || "O PRÓXIMO NOME NA LISTA SERÁ O SEU",
            ctaSubtitle: config.landing_cta_subtitle || "Não deixe para amanhã a aprovação que você pode começar a construir hoje.",
            ctaButtonText: config.landing_cta_button_text || "QUERO SER APROVADO",
            
            footerLegalText: config.landing_footer_legal_text || "Operação 01 © Todos os direitos reservados. Este site não é afiliado ou endossado pelo Facebook ou Google.",
            
            stickyWhatsappEnabled: config.landing_sticky_whatsapp_enabled !== "false", // enabled by default
            stickyWhatsappText: config.landing_sticky_whatsapp_text || "Falar com Consultor",
            
            whatsappNumber: config.contact_whatsapp_number || "5563999999999",
            whatsappMessage: config.contact_whatsapp_message || "Olá! Vim do site e gostaria de saber mais sobre a mentoria.",
            instagramUrl: config.social_instagram_url || "https://instagram.com/operacao01",
            youtubeUrl: config.social_youtube_url || "https://youtube.com/@operacao01",
            fbPixelId: config.marketing_fb_pixel_id || "",
            gtmId: config.marketing_google_tag_manager_id || "",
        };
    } catch (error) {
        logger.error("Failed to fetch landing config:", error);
        return {
            heroTitle: "DOMINE CADA EDITAL",
            heroSubtitle: "A mentoria que transforma seu esforço em nome no Diário Oficial. Do zero à aprovação com o Método Operação 01.",
            heroBadgeText: "🔥 VAGAS LIMITADAS",
            heroPrimaryCtaText: "QUERO SER APROVADO",
            heroSecondaryCtaText: "VER PLANOS",
            heroTrustBar: "Mais de 1.000 alunos aprovados.",
            
            plansTitle: "PLANOS DE ALISTAMENTO",
            plansSubtitle: "Escolha o plano ideal para a sua aprovação.",
            
            featuredTitle: "MURAL DA GLÓRIA",
            featuredSubtitle: "Eles confiaram no método e hoje estão fardados.",
            
            methodTitle: "MÉTODO OPERAÇÃO 01",
            methodSubtitle: "O passo a passo testado e aprovado para sua nomeação.",
            
            ctaTitle: "O PRÓXIMO NOME NA LISTA SERÁ O SEU",
            ctaSubtitle: "Não deixe para amanhã a aprovação que você pode começar a construir hoje.",
            ctaButtonText: "QUERO SER APROVADO",
            
            footerLegalText: "Operação 01 © Todos os direitos reservados. Este site não é afiliado ou endossado pelo Facebook ou Google.",
            
            stickyWhatsappEnabled: true,
            stickyWhatsappText: "Falar com Consultor",
            
            whatsappNumber: "5563999999999",
            whatsappMessage: "Olá! Vim do site e gostaria de saber mais sobre a mentoria.",
            instagramUrl: "https://instagram.com/operacao01",
            youtubeUrl: "https://youtube.com/@operacao01",
            fbPixelId: "",
            gtmId: "",
        };
    }
}
