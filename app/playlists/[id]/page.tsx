import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import PlaylistView from "@/components/playlist-view"

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in, redirect to home
  if (!session) {
    redirect("/")
  }

  // Fetch playlist details
  const { data: playlist } = await supabase.from("playlists").select("*").eq("id", params.id).single()

  if (!playlist) {
    notFound()
  }

  // Fetch playlist songs
  const { data: playlistSongs } = await supabase
    .from("playlist_songs")
    .select("songs(*)")
    .eq("playlist_id", params.id)
    .order("position", { ascending: true })

  const songs = playlistSongs?.map((item) => item.songs) || []

  return <PlaylistView playlist={playlist} songs={songs} user={session.user} />
}
