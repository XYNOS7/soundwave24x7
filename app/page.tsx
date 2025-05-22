import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import LandingPage from "@/components/landing-page"

export default async function Home() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <LandingPage />
}
