import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
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

    // Add song to favorites
    const { data, error } = await supabase
      .from("user_favorites")
      .insert({
        user_id: session.user.id,
        song_id: songId,
      })
      .select()

    if (error) {
      // Check if it's a duplicate error
      if (error.code === "23505") {
        return NextResponse.json({ error: "Song is already in favorites" }, { status: 409 })
      }

      return NextResponse.json({ error: "Failed to add song to favorites" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Add to favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const songId = searchParams.get("songId")

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

    // Remove song from favorites
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", session.user.id)
      .eq("song_id", songId)

    if (error) {
      return NextResponse.json({ error: "Failed to remove song from favorites" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove from favorites error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
