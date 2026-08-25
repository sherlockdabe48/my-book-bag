const https = require("https")

exports.handler = async function (event) {
  const { q, startIndex = "0", maxResults = "20" } = event.queryStringParameters || {}

  if (!q || !q.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing query parameter: q" }) }
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  console.log("[search] key present:", !!apiKey, "| q:", q, "| startIndex:", startIndex)

  const params = new URLSearchParams({
    q,
    printType: "books",
    startIndex,
    maxResults,
    ...(apiKey ? { key: apiKey } : {}),
  })

  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`
  console.log("[search] calling:", url.replace(apiKey || "NOKEY", "***"))

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => {
        console.log("[search] Google status:", res.statusCode)
        resolve({
          statusCode: res.statusCode,
          headers: { "Content-Type": "application/json" },
          body: data,
        })
      })
    }).on("error", (err) => {
      console.error("[search] network error:", err.message)
      resolve({
        statusCode: 502,
        body: JSON.stringify({ error: "Failed to reach Google Books API" }),
      })
    })
  })
}
