import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { LandingPage } from "@/components/landing/LandingPage"
import { getFeaturedStudents, getMethodItems, getPlans, getLandingConfig } from "@/lib/landing"

import { MarketingScripts } from "@/components/landing/MarketingScripts";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === 'ADMIN' || session.user.role === 'MENTOR') {
      redirect("/admin/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

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
