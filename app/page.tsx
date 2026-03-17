import { LandingPage } from "@/components/landing/LandingPage"
import { getFeaturedStudents, getMethodItems, getPlans, getLandingConfig } from "@/lib/landing"
import { MarketingScripts } from "@/components/landing/MarketingScripts";

export const revalidate = 60; // Revalida a cada 60 segundos (ISR)

export default async function RootPage() {
  const featuredStudents = await getFeaturedStudents();
  const methodItems = await getMethodItems();
  const plans = await getPlans();
  const config = await getLandingConfig();

  return (
    <>
      <MarketingScripts fbPixelId={config.fbPixelId} gtmId={config.gtmId} />
      <LandingPage
        featuredStudents={featuredStudents}
        methodItems={methodItems}
        plans={plans}
        config={config}
      />
    </>
  );
}
