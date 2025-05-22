"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, LogOut, Music, Users, MoreVertical, Trash2, Shield, UserIcon, Play } from "lucide-react"
import type { Song, UserProfile } from "@/lib/types"

interface AdminDashboardProps {
  user: User
  profile: UserProfile
  songs: Song[]
  users: UserProfile[]
}

export default function AdminDashboard({ user, profile, songs, users }: AdminDashboardProps) {
  const [currentTab, setCurrentTab] = useState("songs")
  const [searchQuery, setSearchQuery] = useState("")
  const [songToDelete, setSongToDelete] = useState<Song | null>(null)
  const [userToUpdate, setUserToUpdate] = useState<UserProfile | null>(null)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [isDeletingSong, setIsDeletingSong] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Clean up audio element on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [audioElement])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleDeleteSong = async () => {
    if (!songToDelete) return

    setIsDeletingSong(true)

    try {
      const response = await fetch(`/api/admin/songs/${songToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete song")
      }

      toast({
        title: "Song deleted",
        description: `"${songToDelete.title}" has been deleted successfully`,
      })

      // Stop playing if the deleted song is currently playing
      if (currentSong?.id === songToDelete.id) {
        if (audioElement) {
          audioElement.pause()
        }
        setCurrentSong(null)
        setIsPlaying(false)
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error deleting song",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeletingSong(false)
      setSongToDelete(null)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: "user" | "admin") => {
    setIsUpdatingUser(true)

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update user role")
      }

      toast({
        title: "User role updated",
        description: `User role has been updated to ${newRole}`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingUser(false)
      setUserToUpdate(null)
    }
  }

  const playSong = (song: Song) => {
    // Stop current song if playing
    if (audioElement) {
      audioElement.pause()
    }

    // Create new audio element
    const audio = new Audio(song.file_path)
    audio.onended = () => {
      setIsPlaying(false)
    }

    audio
      .play()
      .then(() => {
        setCurrentSong(song)
        setIsPlaying(true)
        setAudioElement(audio)
      })
      .catch((error) => {
        toast({
          title: "Playback error",
          description: "Failed to play the song",
          variant: "destructive",
        })
        console.error("Audio playback error:", error)
      })
  }

  const stopPlayback = () => {
    if (audioElement) {
      audioElement.pause()
    }
    setIsPlaying(false)
    setCurrentSong(null)
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredUsers = users.filter(
    (user) =>
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <span className="text-xs text-amber-400 font-semibold">ADMIN DASHBOARD</span>
          </motion.div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
              <Shield size={16} />
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
              <h3 className="font-bold mb-2 text-sm uppercase text-gray-400">Admin Menu</h3>
              <ul className="space-y-1">
                <li>
                  <Button
                    variant={currentTab === "songs" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("songs")}
                  >
                    <Music className="mr-2 h-4 w-4" />
                    Manage Songs
                  </Button>
                </li>
                <li>
                  <Button
                    variant={currentTab === "users" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentTab("users")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <div className="md:hidden">
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList>
                    <TabsTrigger value="songs">Songs</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {currentTab === "songs" && (
                <motion.div
                  key="songs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#282828] rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-4">All Songs</h3>
                    {filteredSongs.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No songs found</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Artist</TableHead>
                              <TableHead>Album</TableHead>
                              <TableHead>Uploaded By</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSongs.map((song) => (
                              <TableRow key={song.id}>
                                <TableCell className="font-medium">{song.title}</TableCell>
                                <TableCell>{song.artist || "Unknown"}</TableCell>
                                <TableCell>{song.album || "Unknown"}</TableCell>
                                <TableCell>{song.user_profiles?.display_name || "Unknown User"}</TableCell>
                                <TableCell>{new Date(song.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (currentSong?.id === song.id && isPlaying) {
                                          stopPlayback()
                                        } else {
                                          playSong(song)
                                        }
                                      }}
                                    >
                                      {currentSong?.id === song.id && isPlaying ? (
                                        <span className="text-[#1ed760]">■</span>
                                      ) : (
                                        <Play size={16} />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSongToDelete(song)}
                                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#282828] rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-4">All Users</h3>
                    {filteredUsers.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No users found</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User ID</TableHead>
                              <TableHead>Display Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Joined</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((userProfile) => (
                              <TableRow key={userProfile.id}>
                                <TableCell className="font-medium">{userProfile.id}</TableCell>
                                <TableCell>{userProfile.display_name || "No display name"}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      userProfile.role === "admin"
                                        ? "bg-amber-500/20 text-amber-500"
                                        : "bg-blue-500/20 text-blue-500"
                                    }`}
                                  >
                                    {userProfile.role}
                                  </span>
                                </TableCell>
                                <TableCell>{new Date(userProfile.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical size={16} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {userProfile.role === "user" ? (
                                        <DropdownMenuItem
                                          onClick={() => setUserToUpdate(userProfile)}
                                          className="text-amber-500"
                                        >
                                          <Shield className="mr-2 h-4 w-4" />
                                          Make Admin
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem
                                          onClick={() => setUserToUpdate(userProfile)}
                                          className="text-blue-500"
                                        >
                                          <UserIcon className="mr-2 h-4 w-4" />
                                          Make Regular User
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Song Confirmation Dialog */}
      <AlertDialog open={!!songToDelete} onOpenChange={(open) => !open && setSongToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{songToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSong}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeletingSong}
            >
              {isDeletingSong ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update User Role Confirmation Dialog */}
      <AlertDialog open={!!userToUpdate} onOpenChange={(open) => !open && setUserToUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              {userToUpdate?.role === "user"
                ? "Are you sure you want to make this user an administrator? They will have full access to manage all content."
                : "Are you sure you want to remove administrator privileges from this user?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                userToUpdate && handleUpdateUserRole(userToUpdate.id, userToUpdate.role === "user" ? "admin" : "user")
              }
              className={userToUpdate?.role === "user" ? "bg-amber-500 hover:bg-amber-600" : ""}
              disabled={isUpdatingUser}
            >
              {isUpdatingUser ? "Updating..." : userToUpdate?.role === "user" ? "Make Admin" : "Make Regular User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Now Playing Bar */}
      {currentSong && (
        <div className="bg-[#181818] border-t border-[#282828] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-[#333333] rounded-md overflow-hidden mr-3">
                {currentSong.cover_art_path ? (
                  <img
                    src={currentSong.cover_art_path || "/placeholder.svg"}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#333333]">
                    <Music className="h-6 w-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm">{currentSong.title}</h4>
                <p className="text-xs text-gray-400">{currentSong.artist || "Unknown Artist"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopPlayback}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              Stop Playback
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
