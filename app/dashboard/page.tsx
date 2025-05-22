import { redirect } from "next/navigation"
import { createServerClient, getUserRole } from "@/lib/supabase-server"
import Dashboard from "@/components/dashboard"

export default async function DashboardPage() {
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

  // If user is admin, redirect to admin dashboard
  if (userRole === "admin") {
    redirect("/admin")
  }

  // Fetch recently played songs
  const { data: recentSongs } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch user's playlists
  const { data: playlists } = await supabase
    .from("playlists")
    .select("*")
    .eq("created_by", session.user.id)
    .order("created_at", { ascending: false })

  // Fetch user's favorite songs
  const { data: favorites } = await supabase
    .from("user_favorites")
    .select("song_id, songs(*)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Fetch user profile
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", session.user.id).single()

  return (
    <Dashboard
      user={session.user}
      profile={profile || { id: session.user.id, role: "user" }}
      recentSongs={recentSongs || []}
      playlists={playlists || []}
      favorites={favorites?.map((fav) => fav.songs) || []}
    />
  )
}
