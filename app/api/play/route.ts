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

    // Record play history
    const { data, error } = await supabase
      .from("play_history")
      .insert({
        user_id: session.user.id,
        song_id: songId,
      })
      .select()

    if (error) {
      console.error("Failed to record play history:", error)
      // Continue even if recording fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Play recording error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
