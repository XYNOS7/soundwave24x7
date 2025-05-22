"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Play, User } from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const featuresRef = useRef<HTMLElement>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if this is the admin login
      if (email === "srijansinhaaec@gmail.com" && password === "1234567890") {
        // Admin login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: "Admin login successful",
          description: "Welcome to the admin dashboard.",
        })

        router.push("/admin")
        router.refresh()
        return
      }

      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        })

        router.push("/dashboard")
        router.refresh()
      } else {
        // Sign up without email verification
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: "user", // Default to user role
            },
          },
        })

        if (error) throw error

        // Auto sign in after signup
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

        toast({
          title: "Account created!",
          description: "Your account has been created and you're now logged in.",
        })

        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGuestAccess = () => {
    // Redirect to guest experience
    router.push("/guest")
  }

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e1e1e] to-[#121212] flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
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
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8">
        <motion.div
          className="max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">Your Music, Everywhere</h2>
          <p className="text-lg text-gray-300 mb-6">
            Upload, stream, and share your music from anywhere. Create playlists, discover new tracks, and enjoy your
            favorite songs anytime.
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-[#1ed760] hover:bg-[#1ed760]/90 text-black" onClick={handleGuestAccess}>
                <Play className="mr-2 h-4 w-4" /> Try it now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" onClick={scrollToFeatures}>
                Learn more
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login" onClick={() => setAuthMode("login")}>
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" onClick={() => setAuthMode("signup")}>
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {email === "srijansinhaaec@gmail.com" && (
                      <div className="text-sm text-amber-500">Admin login detected</div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Enter your details to create a new account</CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-[#1ed760] hover:bg-[#1ed760]/90 text-black"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 px-6 bg-[#181818]">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            className="bg-[#282828] p-6 rounded-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="h-12 w-12 bg-[#1ed760]/20 rounded-full flex items-center justify-center mb-4">
              <Music className="h-6 w-6 text-[#1ed760]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Upload & Stream</h3>
            <p className="text-gray-300">
              Upload your music and stream it from anywhere. Access your library on any device.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#282828] p-6 rounded-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="h-12 w-12 bg-[#1ed760]/20 rounded-full flex items-center justify-center mb-4">
              <Play className="h-6 w-6 text-[#1ed760]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Create Playlists</h3>
            <p className="text-gray-300">
              Organize your music into playlists. Share them with friends or keep them private.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#282828] p-6 rounded-lg"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="h-12 w-12 bg-[#1ed760]/20 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-[#1ed760]" />
            </div>
            <h3 className="text-xl font-bold mb-2">Discover Music</h3>
            <p className="text-gray-300">Discover new music uploaded by other users. Find your next favorite song.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#121212] text-center">
        <p className="text-gray-400">© 2025 SoundWave. All rights reserved.</p>
      </footer>
    </div>
  )
}
