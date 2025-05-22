import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { name, description } = await request.json()

  if (!name) {
    return NextResponse.json({ error: "Playlist name is required" }, { status: 400 })
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

    // Create playlist
    const { data: playlist, error } = await supabase
      .from("playlists")
      .insert({
        name,
        description,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
    }

    return NextResponse.json({ success: true, playlist })
  } catch (error) {
    console.error("Playlist creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
