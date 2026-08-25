export interface AuthUser {
  accessToken: string
  email: string
  name: string
  avatarURL: string
}

export interface AuthContextValue {
  user: AuthUser | null
  signIn: () => void
  signOut: () => void
  isAuthReady: boolean
}
