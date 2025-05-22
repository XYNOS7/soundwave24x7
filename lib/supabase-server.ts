import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export async function getUserRole(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single()

  if (error || !data) {
    return "user" // Default to user role if not found
  }

  return data.role
}
