"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useGlobalStore } from "./use-global-store"

export function useSignOut() {
  const router = useRouter()
  const { toast } = useToast()
  const setSession = useGlobalStore((s) => s.setSession)

  const signOut = async () => {
    setSession(null)

    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account",
    })

    router.push("/")
    router.refresh()
  }

  return { signOut }
}
