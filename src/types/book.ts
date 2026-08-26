export interface Book {
  id: string
  title: string
  author: string
  allPages: number | "N/A"
  currentPage: number
  imageURL: string
  description: string | false
  isbn: string | false
  status: "onRead" | "reading" | "finish"
  note: string
  recommendedBy: string
  lastReadAt: string   // ISO date string, e.g. "2026-01-15", or "" if never
}
