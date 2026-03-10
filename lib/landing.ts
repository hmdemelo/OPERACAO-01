
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
            heroVideoUrl: config.landing_hero_video_url || "",
            ctaTitle: config.landing_cta_title || "O PRÓXIMO NOME NA LISTA SERÁ O SEU",
            ctaButtonText: config.landing_cta_button_text || "QUERO SER APROVADO",
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
            heroVideoUrl: "",
            ctaTitle: "O PRÓXIMO NOME NA LISTA SERÁ O SEU",
            ctaButtonText: "QUERO SER APROVADO",
            whatsappNumber: "5563999999999",
            whatsappMessage: "Olá! Vim do site e gostaria de saber mais sobre a mentoria.",
            instagramUrl: "https://instagram.com/operacao01",
            youtubeUrl: "https://youtube.com/@operacao01",
            fbPixelId: "",
            gtmId: "",
        };
    }
}
