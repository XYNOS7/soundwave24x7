export interface Song {
  id: string
  title: string
  artist?: string
  album?: string
  duration?: number
  file_path: string
  cover_art_path?: string
  created_at: string
  updated_at: string
  uploaded_by: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  cover_art_path?: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface UserProfile {
  id: string
  role: "user" | "admin"
  display_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface PlaylistSong {
  id: string
  playlist_id: string
  song_id: string
  position: number
  added_at: string
  songs?: Song
}

export interface UserFavorite {
  id: string
  user_id: string
  song_id: string
  created_at: string
  songs?: Song
}
