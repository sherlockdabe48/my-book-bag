/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_GOOGLE_BOOKS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
