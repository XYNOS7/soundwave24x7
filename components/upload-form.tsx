"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, ArrowLeft, ImageIcon } from "lucide-react"
import type { User } from "@supabase/auth-helpers-nextjs"

interface UploadFormProps {
  user: User
}

export default function UploadForm({ user }: UploadFormProps) {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [album, setAlbum] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverArt, setCoverArt] = useState<File | null>(null)
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const audioInputRef = useRef<HTMLInputElement>(null)
  const coverArtInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const { toast } = useToast()

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("audio/")) {
        setAudioFile(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive",
        })
      }
    }
  }

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setCoverArt(file)

        // Create preview URL
        const reader = new FileReader()
        reader.onload = (e) => {
          setCoverArtPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your song",
        variant: "destructive",
      })
      return
    }

    if (!audioFile) {
      toast({
        title: "Audio file required",
        description: "Please select an audio file to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("title", title)
      formData.append("artist", artist)
      formData.append("album", album)
      formData.append("audioFile", audioFile)

      if (coverArt) {
        formData.append("coverArt", coverArt)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Upload song
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Safely parse the JSON response
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing response:", parseError)
        throw new Error("Failed to parse server response")
      }

      if (!response.ok) {
        throw new Error(data?.error || `Upload failed with status: ${response.status}`)
      }

      toast({
        title: "Upload successful",
        description: `"${title}" has been uploaded successfully`,
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e1e] to-[#121212] p-6">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Upload Music</CardTitle>
            <CardDescription>Share your music with the world</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title"
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  placeholder="Album name"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Audio File *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Music className="mr-2 h-4 w-4" />
                    {audioFile ? "Change Audio File" : "Select Audio File"}
                  </Button>
                </div>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                {audioFile && <p className="text-sm text-gray-400 truncate">Selected: {audioFile.name}</p>}
              </div>

              <div className="space-y-2">
                <Label>Cover Art (optional)</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 bg-[#333333] rounded-md overflow-hidden flex items-center justify-center">
                      {coverArtPreview ? (
                        <img
                          src={coverArtPreview || "/placeholder.svg"}
                          alt="Cover art preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => coverArtInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {coverArt ? "Change Cover Art" : "Select Cover Art"}
                  </Button>
                </div>
                <input
                  ref={coverArtInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverArtChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 flex justify-between">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-[#333333] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#1ed760]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
                disabled={isUploading || !audioFile}
              >
                {isUploading ? "Uploading..." : "Upload Song"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
