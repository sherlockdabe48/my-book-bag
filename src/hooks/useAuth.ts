import { useState, useEffect, useRef, useCallback } from "react"
import type { AuthUser } from "../types/auth"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const SCOPE = "https://www.googleapis.com/auth/books"
const USER_KEY = "myBookBag.authUser"

export default function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(USER_KEY)
      return stored ? (JSON.parse(stored) as AuthUser) : null
    } catch {
      return null
    }
  })
  const [isAuthReady, setIsAuthReady] = useState(false)
  const tokenClientRef = useRef<{ requestAccessToken: () => void } | null>(null)

  // Initialise GIS token client once the script has loaded
  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn("[useAuth] VITE_GOOGLE_CLIENT_ID is not set — sign-in disabled")
      setIsAuthReady(true)
      return
    }

    function init() {
      tokenClientRef.current = window.google!.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: async (response) => {
          if (response.error || !response.access_token) {
            console.error("[useAuth] token error:", response.error)
            return
          }
          // Fetch user profile with the token
          try {
            const res = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              { headers: { Authorization: `Bearer ${response.access_token}` } }
            )
            const profile = await res.json() as {
              email: string
              name: string
              picture: string
            }
            const authUser: AuthUser = {
              accessToken: response.access_token,
              email: profile.email,
              name: profile.name,
              avatarURL: profile.picture,
            }
            setUser(authUser)
            sessionStorage.setItem(USER_KEY, JSON.stringify(authUser))
          } catch (e) {
            console.error("[useAuth] failed to fetch user profile:", e)
          }
        },
      })
      setIsAuthReady(true)
    }

    // GIS script may already be loaded or needs to wait
    if (window.google?.accounts?.oauth2) {
      init()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval)
          init()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  const signIn = useCallback(() => {
    tokenClientRef.current?.requestAccessToken()
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(USER_KEY)
  }, [])

  return { user, signIn, signOut, isAuthReady }
}
