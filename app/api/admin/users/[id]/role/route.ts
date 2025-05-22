import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { role } = await request.json()

  if (!role || !["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the current user is an admin
    const { data: adminCheck } = await supabase.from("user_profiles").select("role").eq("id", session.user.id).single()

    if (!adminCheck || adminCheck.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Update the user's role
    const { data, error } = await supabase.from("user_profiles").update({ role }).eq("id", params.id).select()

    if (error) {
      return NextResponse.json({ error: "Failed to update user role" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Update user role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
