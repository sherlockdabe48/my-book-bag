import React, { useEffect, useRef, useState } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import Header from "./Header.jsx"
import SearchPage from "./SearchPage.jsx"
import ShelfBagWrapper from "./ShelfBagWrapper.jsx"
import WelcomeMessage from "./WelcomeMessage.jsx"
import "../css/app.css"
import MobileSearchBox from "./MobileSearchBox.jsx"
import axios from "axios"

const BAG_BOOKS_LOCAL_STORAGE_KEY = "myBookBag.bagBooks"
const SHELF_BOOKS_LOCAL_STORAGE_KEY = "myBookBag.shelfBooks"
const SEARCH_URI = "https://www.googleapis.com/books/v1/volumes"
const GOOGLE_BOOKS_API_KEY = import.meta.env.REACT_APP_GOOGLE_BOOKS_API_KEY

export const bookBagContext = React.createContext()
export const toggleClassContext = React.createContext()
export const searchBookContext = React.createContext()

function App() {
  const [bagBooks, setBagBooks] = useState([])
  const [shelfBooks, setShelfBooks] = useState([])
  const [selectedBookId, setSelectedBookId] = useState()
  const haveSomeBook = bagBooks.length > 0 || shelfBooks.length > 0
  const [toggleClass, setToggleClass] = useState(false)
  const [shelfHighLight, setShelfHighLight] = useState(false)
  const [bookData, setBookData] = useState([])
  const [searchBooks, setSearchBooks] = useState([])
  const [searchInputValue, setSearchInputValue] = useState("")
  const [startIndex, setStartIndex] = useState(0)
  const [totalSearchItems, setTotalSearchItems] = useState(0)

  const [loading, setLoading] = useState(true)
  const inputRef = useRef([])

  function handleNextPageInSearchBook() {
    setStartIndex((prevStartIndex) => prevStartIndex + 20)
  }
  function handlePrevPageInSearchBook() {
    setStartIndex((prevStartIndex) => prevStartIndex - 20)
  }

  function handleGetSearchBooksData(volumes) {
    setSearchBooks(
      volumes.map((volume) => {
        return {
          id: volume.id,
          title: volume.volumeInfo.title,
          author: volume.volumeInfo.authors
            ? volume.volumeInfo.authors.join(", ")
            : "N/A",
          allPages: volume.volumeInfo.pageCount
            ? volume.volumeInfo.pageCount
            : "N/A",
          currentPage: 1,
          imageURL: volume.volumeInfo.imageLinks
            ? volume.volumeInfo.imageLinks.thumbnail
            : "../images/mybookbag-image-cover-sample-01.jpg",
          description: volume.volumeInfo.description
            ? volume.volumeInfo.description
            : false,
          status: "onRead",
        }
      })
    )
  }

  function handleGetSearchInputValue(inputValue) {
    setSearchInputValue(inputValue)
    setStartIndex(0)
  }

  function handleClearSearchInputValue() {
    setSearchInputValue("")
  }

  useEffect(() => {
    handleGetSearchBooksData(bookData)
  }, [bookData])

  useEffect(() => {
    if (!searchInputValue.trim()) {
      setLoading(false)
      setBookData([])
      setSearchBooks([])
      setTotalSearchItems(0)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const params = {
      q: searchInputValue,
      printType: "books",
      startIndex,
      maxResults: 20,
    }

    if (GOOGLE_BOOKS_API_KEY) {
      params.key = GOOGLE_BOOKS_API_KEY
    }

    axios
      .get(SEARCH_URI, {
        params,
        signal: controller.signal,
      })
      .then((res) => {
        setLoading(false)
        if (!res.data.items) return
        setTotalSearchItems(res.data.totalItems)
        setBookData(res.data.items.map((i) => i))
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setLoading(false)
      })

    return () => controller.abort()
  }, [searchInputValue, startIndex])

  //load data
  useEffect(() => {
    const bagBookJson = localStorage.getItem(BAG_BOOKS_LOCAL_STORAGE_KEY)
    if (bagBookJson != null) setBagBooks(JSON.parse(bagBookJson))
    const shelfBookJson = localStorage.getItem(SHELF_BOOKS_LOCAL_STORAGE_KEY)
    if (shelfBookJson != null) setShelfBooks(JSON.parse(shelfBookJson))
  }, [])

  //save data
  useEffect(() => {
    localStorage.setItem(BAG_BOOKS_LOCAL_STORAGE_KEY, JSON.stringify(bagBooks))
    localStorage.setItem(
      SHELF_BOOKS_LOCAL_STORAGE_KEY,
      JSON.stringify(shelfBooks)
    )
  }, [bagBooks, shelfBooks])

  const searchBookContextValue = {
    handleGetSearchInputValue,
    handleClearSearchInputValue,
    handleNextPageInSearchBook,
    handlePrevPageInSearchBook,
    handleMoveToShelfFromSearch,
  }

  const bookBagContextValue = {
    handleAddToBagFromShelf,
    handleBookSelect,
    handleBookDeleteFromShelf,
    handleMoveToShelfFromBag,
    handleBagBookProgressChange,
  }

  const toggleClassContextValue = {
    handleActiveShelfHighLight,
  }

  function handleActiveShelfHighLight() {
    setTimeout(() => {
      setShelfHighLight(false)
    }, 1500)
    setShelfHighLight(true)
  }

  function handleAddToBagFromShelf(id) {
    const newBagBook = shelfBooks.find((shelfBook) => shelfBook.id === id)
    setSelectedBookId(newBagBook.id)
    setBagBooks([...bagBooks, newBagBook])
    setShelfBooks(shelfBooks.filter((shelfBook) => shelfBook.id !== id))
  }

  function handleBookSelect(id) {
    setSelectedBookId(id)
  }

  function handleMoveToShelfFromSearch(id) {
    const bookFromSearch = searchBooks.find(
      (searchBook) => searchBook.id === id
    )
    if (!bookFromSearch || shelfBooks.some((shelfBook) => shelfBook.id === id))
      return
    setSelectedBookId(bookFromSearch.id)
    setShelfBooks([...shelfBooks, bookFromSearch])
  }

  function handleMoveToShelfFromBag(id) {
    const bookFromBag = bagBooks.find((bagBook) => bagBook.id === id)
    setSelectedBookId(bookFromBag.id)
    setShelfBooks([...shelfBooks, bookFromBag])
    setBagBooks(bagBooks.filter((bagBook) => bagBook.id !== id))
  }

  function handleBagBookProgressChange(id, currentPage) {
    setBagBooks(
      bagBooks.map((bagBook) => {
        if (bagBook.id !== id) return bagBook
        return { ...bagBook, currentPage }
      })
    )
  }

  function handleBookDeleteFromShelf(id) {
    if (selectedBookId != null && selectedBookId === id) {
      setSelectedBookId(undefined)
    }
    setShelfBooks(shelfBooks.filter((shelfBook) => shelfBook.id !== id))
  }

  return (
    <Router>
      <searchBookContext.Provider value={searchBookContextValue}>
        <Header inputRef={inputRef} />
        <MobileSearchBox inputRef={inputRef} />
        {/* <Switch>
          <Route path="/search-page"> */}
        {searchInputValue && (
          <SearchPage
            loading={loading}
            searchBooks={searchBooks}
            searchInputValue={searchInputValue}
            startIndex={startIndex}
            totalSearchItems={totalSearchItems}
            shelfBooks={shelfBooks}
          />
        )}
        {/* </Route>
        </Switch> */}
      </searchBookContext.Provider>
      {!haveSomeBook && <WelcomeMessage />}

      <bookBagContext.Provider value={bookBagContextValue}>
        <toggleClassContext.Provider value={toggleClassContextValue}>
          {haveSomeBook && (
            <ShelfBagWrapper
              bagBooks={bagBooks}
              shelfBooks={shelfBooks}
              toggleClass={toggleClass}
              shelfHighLight={shelfHighLight}
              inputRef={inputRef}
            />
          )}
        </toggleClassContext.Provider>
      </bookBagContext.Provider>
    </Router>
  )
}

// const sampleBagBooks = [
//   {
//     id: 1,
//     title: "Benjamin Flanklin",
//     author: "Walter Isaacson",
//     allPages: 602,
//     currentPage: 364,
//     imageURL: "../images/benfranklin.jpg",
//     status: "onRead",
//   },
//   {
//     id: 2,
//     title: "The Hobbit",
//     author: "Jrr. Tolkien",
//     allPages: 340,
//     currentPage: 201,
//     imageURL: "../images/hobbit.jpg",
//     status: "finish",
//   },
// ]

// const sampleShelfBooks = [
//   {
//     id: 3,
//     title: "Steve Jobs",
//     author: "Walter Isaacson",
//     allPages: 588,
//     currentPage: 120,
//     imageURL: "../images/jobs.jpg",
//   },
//   {
//     id: 4,
//     title: "Harry Potter",
//     author: "J.K. Rowling",
//     allPages: 251,
//     currentPage: 1,
//     imageURL: "../images/harry1.jpg",
//   },
//   {
//     id: 5,
//     title: "Deep Work",
//     author: "Carl Mark",
//     allPages: 289,
//     currentPage: 17,
//     imageURL: "../images/deepwork.jpg",
//   },
//   {
//     id: 6,
//     title: "The Innovators",
//     author: "Walter Isaacson",
//     allPages: 400,
//     currentPage: 10,
//     imageURL: "../images/innovators.jpg",
//   },
//   {
//     id: 7,
//     title: "Elon Musk",
//     author: "Ashlee Wange",
//     allPages: 400,
//     currentPage: 10,
//     imageURL: "../images/elonmusk.jpg",
//   },
//   {
//     id: 8,
//     title: "Steve Noob",
//     author: "Steve Noob",
//     allPages: 400,
//     currentPage: 10,
//     imageURL: "../images/noob.jpg",
//   },
// ]

export default App
