import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import UploadForm from "@/components/upload-form"

export default async function UploadPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not logged in, redirect to home
  if (!session) {
    redirect("/")
  }

  return <UploadForm user={session.user} />
}
