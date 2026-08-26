export interface Book {
  id: string
  title: string
  author: string
  allPages: number | "N/A"
  currentPage: number
  imageURL: string
  description: string | false
  isbn: string | false
  status: "onRead" | "finish"
}
