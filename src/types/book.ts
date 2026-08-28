export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  allPages: number | "N/A"
  currentPage: number
  imageURL: string
  description: string | false
  isbn: string | false
  status: "onRead" | "reading" | "finish"
  note: string
  recommendedBy: string
  lastReadAt: string   // ISO date string, e.g. "2026-01-15", or "" if never
  timesRead: number    // how many times the reader has finished this book
}
