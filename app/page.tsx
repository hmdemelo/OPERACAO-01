import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/authOptions"
import { redirect } from "next/navigation"
import { LandingPage } from "@/components/landing/LandingPage"
import { getFeaturedStudents, getMethodItems } from "@/lib/landing"

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    if (session.user.role === "ADMIN" || session.user.role === "MENTOR") {
      redirect("/admin/dashboard")
    }

    if (session.user.role === "STUDENT") {
      redirect("/student/dashboard")
    }
  }

  const featuredStudents = await getFeaturedStudents()
  const methodItems = await getMethodItems()

  return <LandingPage featuredStudents={featuredStudents} methodItems={methodItems} />
}
