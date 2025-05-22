import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the current user is an admin
    const { data: adminCheck } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Get the song details to delete the file from storage
    const { data: song } = await supabase.from("songs").select("file_path, cover_art_path").eq("id", params.id).single()

    if (song) {
      // Extract file names from paths
      const audioFileName = song.file_path.split("/").pop()

      if (audioFileName) {
        // Delete the audio file from storage
        await supabase.storage.from("songs").remove([audioFileName])
      }

      if (song.cover_art_path) {
        const coverFileName = song.cover_art_path.split("/").pop()
        if (coverFileName) {
          // Delete the cover art from storage
          await supabase.storage.from("covers").remove([coverFileName])
        }
      }
    }

    // Delete the song from the database
    const { error } = await supabase.from("songs").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete song" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete song error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
