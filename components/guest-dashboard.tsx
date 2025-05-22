"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Music, Search, Play, LogOut, User } from "lucide-react"
import MusicPlayer from "@/components/music-player"
import type { Song } from "@/lib/types"

interface GuestDashboardProps {
  songs: Song[]
}

export default function GuestDashboard({ songs }: GuestDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const router = useRouter()

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white font-['Montserrat']">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center p-4 bg-[#181818] bg-opacity-90 backdrop-blur-md z-10">
        <div className="flex items-center">
          <motion.div
            className="text-[#1ed760] text-3xl font-bold mr-2"
            whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
          >
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 2L8 8M22 2L16 8M8 16L2 22M16 16L22 22" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </motion.div>
          <motion.div className="flex flex-col">
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-[#1ed760] to-[#ff6ec7] bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              SoundWave
            </motion.h1>
            <span className="text-xs text-blue-400 font-semibold">GUEST MODE</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">Exit Guest Mode</span>
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black flex items-center gap-2">
              <User size={16} />
              <span>Sign Up</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="bg-[#121212] w-64 overflow-y-auto hidden md:block">
          <div className="p-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 bg-[#282828] border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2 text-sm uppercase text-gray-400">Guest Features</h3>
              <ul className="space-y-1">
                <li>
                  <Button variant="secondary" className="w-full justify-start">
                    <Music className="mr-2 h-4 w-4" />
                    Discover Music
                  </Button>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-[#282828] rounded-lg">
              <h3 className="font-bold mb-2">Create an Account</h3>
              <p className="text-sm text-gray-400 mb-4">
                Sign up to upload your own music, create playlists, and more!
              </p>
              <Link href="/">
                <Button className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Discover Music</h2>
                  <div className="md:hidden relative w-full max-w-[200px]">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 bg-[#282828] border-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-[#282828]/50 p-6 rounded-lg mb-8">
                  <h3 className="text-xl font-bold mb-4">Welcome to SoundWave!</h3>
                  <p className="text-gray-300 mb-4">
                    You're browsing as a guest. Feel free to explore and listen to music, but sign up to unlock all
                    features!
                  </p>
                  <div className="flex gap-4">
                    <Link href="/">
                      <Button className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black">Sign Up Now</Button>
                    </Link>
                  </div>
                </div>

                {searchQuery && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Search Results</h3>
                    {filteredSongs.length === 0 ? (
                      <p className="text-gray-400">No songs found matching "{searchQuery}"</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredSongs.map((song) => (
                          <SongCard key={song.id} song={song} onPlay={() => playSong(song)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">Popular Tracks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {songs.map((song) => (
                      <SongCard key={song.id} song={song} onPlay={() => playSong(song)} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Music Player */}
      {currentSong && (
        <div className="bg-[#181818] border-t border-[#282828] p-4">
          <MusicPlayer
            song={currentSong}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={() => {
              const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
              if (currentIndex < songs.length - 1) {
                playSong(songs[currentIndex + 1])
              }
            }}
            onPrevious={() => {
              const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
              if (currentIndex > 0) {
                playSong(songs[currentIndex - 1])
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

interface SongCardProps {
  song: Song
  onPlay: () => void
}

function SongCard({ song, onPlay }: SongCardProps) {
  return (
    <Card className="bg-[#282828] border-none hover:bg-[#383838] transition-colors group">
      <CardContent className="p-4 relative">
        <div className="relative mb-4">
          <div className="aspect-square bg-[#333333] rounded-md overflow-hidden">
            {song.cover_art_path ? (
              <img
                src={song.cover_art_path || "/placeholder.svg"}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="h-12 w-12 text-gray-500" />
              </div>
            )}
          </div>
          <motion.button
            className="absolute bottom-2 right-2 bg-[#1ed760] rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPlay}
          >
            <Play className="h-5 w-5 text-black" />
          </motion.button>
        </div>
        <h3 className="font-bold truncate">{song.title}</h3>
        <p className="text-gray-400 text-sm truncate">{song.artist || "Unknown Artist"}</p>
      </CardContent>
    </Card>
  )
}
