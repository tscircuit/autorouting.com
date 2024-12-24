"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useGlobalStore } from "@/hooks/use-global-store"

function AuthorizeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setSession = useGlobalStore((s) => s.setSession)

  useEffect(() => {
    const sessionToken = searchParams.get("session_token")
    if (!sessionToken) {
      router.push("/contribute")
      return
    }

    // Parse the JWT token to get session info
    const [_header, payload, _signature] = sessionToken.split(".")
    const decodedPayload = JSON.parse(atob(payload!))

    // Store the session
    setSession({
      token: sessionToken,
      account_id: decodedPayload.account_id,
      session_id: decodedPayload.session_id,
      github_username: decodedPayload.github_username,
    })

    // Redirect back to home page
    router.push("/contribute")
  }, [searchParams, router, setSession])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Authorizing...</p>
    </div>
  )
}

export default function AuthorizePage() {
  return (
    <Suspense>
      <AuthorizeContent />
    </Suspense>
  )
}
