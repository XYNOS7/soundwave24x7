import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audioFile") as File
    const coverArt = formData.get("coverArt") as File | null
    const title = formData.get("title") as string
    const artist = formData.get("artist") as string
    const album = formData.get("album") as string

    if (!audioFile || !title) {
      return NextResponse.json({ error: "Audio file and title are required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Upload audio file
    const audioFileName = `${Date.now()}-${audioFile.name}`
    const { data: audioData, error: audioError } = await supabase.storage.from("songs").upload(audioFileName, audioFile)

    if (audioError) {
      console.error("Audio upload error:", audioError)
      return NextResponse.json({ error: "Failed to upload audio file: " + audioError.message }, { status: 500 })
    }

    // Upload cover art if provided
    let coverArtPath = null
    if (coverArt) {
      const coverFileName = `${Date.now()}-${coverArt.name}`
      const { data: coverData, error: coverError } = await supabase.storage
        .from("covers")
        .upload(coverFileName, coverArt)

      if (!coverError) {
        const { data } = supabase.storage.from("covers").getPublicUrl(coverFileName)
        coverArtPath = data.publicUrl
      } else {
        console.error("Cover art upload error:", coverError)
        // Continue even if cover art upload fails
      }
    }

    // Get audio file URL
    const { data } = supabase.storage.from("songs").getPublicUrl(audioFileName)
    const audioUrl = data.publicUrl

    // Insert song record in database
    const { data: song, error: dbError } = await supabase
      .from("songs")
      .insert({
        title,
        artist: artist || null,
        album: album || null,
        file_path: audioUrl,
        cover_art_path: coverArtPath,
        uploaded_by: session.user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save song metadata: " + dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, song })
  } catch (error) {
    console.error("Upload error:", error)
    // Ensure we return a proper JSON response even for unexpected errors
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    )
  }
}
