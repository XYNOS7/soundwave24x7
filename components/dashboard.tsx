"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Play, Search, Plus, Upload, LogOut, Music, Heart, BarChart2, UserIcon } from "lucide-react"
import MusicPlayer from "@/components/music-player"
import type { Song, Playlist, UserProfile } from "@/lib/types"

interface DashboardProps {
  user: User
  profile: UserProfile
  recentSongs: Song[]
  playlists: Playlist[]
  favorites: Song[]
}

export default function Dashboard({ user, profile, recentSongs, playlists, favorites }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState("discover")
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [playlistName, setPlaylistName] = useState("")
  const [playlistDescription, setPlaylistDescription] = useState("")
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false })

      if (error) {
        toast({
          title: "Error fetching songs",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setAllSongs(data || [])
    }

    fetchSongs()
  }, [supabase, toast])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      toast({
        title: "Playlist name required",
        description: "Please enter a name for your playlist",
        variant: "destructive",
      })
      return
    }

    setIsCreatingPlaylist(true)

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create playlist")
      }

      toast({
        title: "Playlist created",
        description: `"${playlistName}" has been created successfully`,
      })

      setShowCreatePlaylist(false)
      setPlaylistName("")
      setPlaylistDescription("")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error creating playlist",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreatingPlaylist(false)
    }
  }

  const playSong = async (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)

    // Record play in history
    try {
      await fetch("/api/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: song.id,
        }),
      })
    } catch (error) {
      console.error("Failed to record play:", error)
    }
  }

  const toggleFavorite = async (song: Song, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        // Remove from favorites
        await fetch(`/api/favorites?songId=${song.id}`, {
          method: "DELETE",
        })

        toast({
          title: "Removed from favorites",
          description: `"${song.title}" has been removed from your favorites`,
        })
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            songId: song.id,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to add to favorites")
        }

        toast({
          title: "Added to favorites",
          description: `"${song.title}" has been added to your favorites`,
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredSongs = allSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const isFavorite = (songId: string) => {
    return favorites.some((fav) => fav.id === songId)
  }

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
          <motion.h1
            className="text-2xl font-bold bg-gradient-to-r from-[#1ed760] to-[#ff6ec7] bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            SoundWave
          </motion.h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/upload">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#1ed760] flex items-center justify-center">
              <UserIcon size={16} />
            </div>
            <span className="hidden md:inline">{user.email}</span>
          </div>
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
              <h3 className="font-bold mb-2 text-sm uppercase text-gray-400">Menu</h3>
              <ul className="space-y-1">
                <li>
                  <Button
                    variant={currentTab === "discover" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("discover")}
                  >
                    <Music className="mr-2 h-4 w-4" />
                    Discover
                  </Button>
                </li>
                <li>
                  <Button
                    variant={currentTab === "favorites" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("favorites")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Button>
                </li>
                <li>
                  <Button
                    variant={currentTab === "playlists" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("playlists")}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Playlists
                  </Button>
                </li>
                <li>
                  <Button
                    variant={currentTab === "analytics" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("analytics")}
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm uppercase text-gray-400">Your Playlists</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowCreatePlaylist(true)}>
                  <Plus size={16} />
                </Button>
              </div>
              <ul className="space-y-1">
                {playlists.length === 0 ? (
                  <li className="text-sm text-gray-500 py-2 px-3">No playlists yet</li>
                ) : (
                  playlists.map((playlist) => (
                    <li key={playlist.id}>
                      <Link href={`/playlists/${playlist.id}`}>
                        <Button variant="ghost" className="w-full justify-start text-sm h-8">
                          {playlist.name}
                        </Button>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {currentTab === "discover" && (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Discover Music</h2>

                  {searchQuery && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Search Results</h3>
                      {filteredSongs.length === 0 ? (
                        <p className="text-gray-400">No songs found matching "{searchQuery}"</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {filteredSongs.map((song) => (
                            <SongCard
                              key={song.id}
                              song={song}
                              onPlay={() => playSong(song)}
                              onToggleFavorite={() => toggleFavorite(song, isFavorite(song.id))}
                              isFavorite={isFavorite(song.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Recently Added</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {allSongs.slice(0, 8).map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          onPlay={() => playSong(song)}
                          onToggleFavorite={() => toggleFavorite(song, isFavorite(song.id))}
                          isFavorite={isFavorite(song.id)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentTab === "favorites" && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Your Favorites</h2>

                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                      <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
                      <p className="text-gray-400 mb-6">Add songs to your favorites to see them here</p>
                      <Button
                        onClick={() => setCurrentTab("discover")}
                        className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
                      >
                        Discover Music
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {favorites.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          onPlay={() => playSong(song)}
                          onToggleFavorite={() => toggleFavorite(song, true)}
                          isFavorite={true}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentTab === "playlists" && (
                <motion.div
                  key="playlists"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Playlists</h2>
                    <Button
                      onClick={() => setShowCreatePlaylist(true)}
                      className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Playlist
                    </Button>
                  </div>

                  {playlists.length === 0 ? (
                    <div className="text-center py-12">
                      <Music className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                      <h3 className="text-xl font-bold mb-2">No playlists yet</h3>
                      <p className="text-gray-400 mb-6">Create your first playlist to organize your music</p>
                      <Button
                        onClick={() => setShowCreatePlaylist(true)}
                        className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create Playlist
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {playlists.map((playlist) => (
                        <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                          <Card className="bg-[#282828] border-none hover:bg-[#383838] transition-colors cursor-pointer h-full">
                            <CardContent className="p-6">
                              <div className="h-32 w-32 mx-auto bg-[#333333] rounded-md mb-4 flex items-center justify-center">
                                <Music className="h-16 w-16 text-gray-500" />
                              </div>
                              <h3 className="font-bold text-lg mb-1 truncate">{playlist.name}</h3>
                              {playlist.description && (
                                <p className="text-gray-400 text-sm line-clamp-2">{playlist.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentTab === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Your Analytics</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-[#282828] border-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Listening History</h3>
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-400">Coming soon</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#282828] border-none">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">Top Tracks</h3>
                        <div className="h-64 flex items-center justify-center">
                          <p className="text-gray-400">Coming soon</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
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
              /* Handle next */
            }}
            onPrevious={() => {
              /* Handle previous */
            }}
          />
        </div>
      )}

      {/* Create Playlist Dialog */}
      <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>Give your playlist a name and optional description</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="playlist-name" className="text-sm font-medium">
                Playlist Name
              </label>
              <Input
                id="playlist-name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="playlist-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="playlist-description"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="A collection of my favorite songs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
              disabled={isCreatingPlaylist}
            >
              {isCreatingPlaylist ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface SongCardProps {
  song: Song
  onPlay: () => void
  onToggleFavorite: () => void
  isFavorite: boolean
}

function SongCard({ song, onPlay, onToggleFavorite, isFavorite }: SongCardProps) {
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
        <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={onToggleFavorite}>
          {isFavorite ? <Heart className="h-5 w-5 fill-[#1ed760] text-[#1ed760]" /> : <Heart className="h-5 w-5" />}
        </button>
      </CardContent>
    </Card>
  )
}
