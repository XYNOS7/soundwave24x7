import { redirect } from "next/navigation"
import { createServerClient, getUserRole } from "@/lib/supabase-server"
import AdminDashboard from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in, redirect to home
  if (!session) {
    redirect("/")
  }

  // Get user role
  const userRole = await getUserRole(session.user.id)

  // If user is not admin, redirect to dashboard
  if (userRole !== "admin") {
    redirect("/dashboard")
  }

  // Fetch all songs
  const { data: songs } = await supabase
    .from("songs")
    .select("*, user_profiles!songs_uploaded_by_fkey(display_name)")
    .order("created_at", { ascending: false })

  // Fetch all users
  const { data: users } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

  return (
    <AdminDashboard
      user={session.user}
      profile={profile || { id: session.user.id, role: "admin" }}
      songs={songs || []}
      users={users || []}
    />
  )
}
