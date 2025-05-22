import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import GuestDashboard from "@/components/guest-dashboard"

export default async function GuestPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  // Fetch recently added songs for guest experience
  const { data: recentSongs } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12)

  return <GuestDashboard songs={recentSongs || []} />
}
