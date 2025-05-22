import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { songId } = await request.json()

  if (!songId) {
    return NextResponse.json({ error: "Song ID is required" }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if playlist exists and belongs to user
    const { data: playlist } = await supabase
      .from("playlists")
      .select()
      .eq("id", params.id)
      .eq("created_by", session.user.id)
      .single()

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found or access denied" }, { status: 404 })
    }

    // Get current highest position
    const { data: positions } = await supabase
      .from("playlist_songs")
      .select("position")
      .eq("playlist_id", params.id)
      .order("position", { ascending: false })
      .limit(1)

    const nextPosition = positions && positions.length > 0 ? positions[0].position + 1 : 0

    // Add song to playlist
    const { data, error } = await supabase
      .from("playlist_songs")
      .insert({
        playlist_id: params.id,
        song_id: songId,
        position: nextPosition,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: "Failed to add song to playlist" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Add to playlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
