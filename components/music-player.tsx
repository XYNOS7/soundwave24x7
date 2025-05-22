"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react"
import type { Song } from "@/lib/types"

interface MusicPlayerProps {
  song: Song
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
}

export default function MusicPlayer({ song, isPlaying, onPlayPause, onNext, onPrevious }: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(song.file_path)
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0)
      })
      
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      
      audioRef.current.addEventListener("ended", () => {
        onNext()
      })
    } else {
      audioRef.current.src = song.file_path
      audioRef.current.load()
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [song, onNext])
  
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }
  
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }
  
  return (
    <div className="flex items-center">
      {/* Song Info */}
      <div className="flex items-center w-1/4">
        <div className="h-12 w-12 bg-[#333333] rounded-md overflow-hidden mr-3">
          {song.cover_art_path ? (
            <img 
              src={song.cover_art_path || "/placeholder.svg"} 
              alt={song.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#333333]" />
          )}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm truncate">{song.title}</h4>
          <p className="text-xs text-gray-400 truncate">{song.artist || "Unknown Artist"}</p>
        </div>
      </div>
      
      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-2">
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onPrevious}
          >
            <SkipBack size={20} />
          </button>
          <motion.button
            className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </motion.button>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={onNext}
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="w-full max-w-md flex items-center gap-2">
          <span className="text-xs text-gray-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>
                  <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="h-1 w-24 bg-gray-600 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1ed760 ${volume * 100}%, #535353 ${volume * 100}%)`,
          }}
        />
      

      
      {/* Volume Control */}
      <div className="w-1/4 flex justify-end items-center gap-2">
        <button 
          className="text-gray-400 hover:text-white"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
  className="h-1 w-24 bg-gray-600 rounded-full appearance-none cursor-pointer"
  style={{
    background: `linear-gradient(to right, #1ed760 ${volume * 100}%, #535353 ${volume * 100}%)`,
  }}
/>
</div>
</div>
