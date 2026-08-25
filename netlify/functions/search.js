const https = require("https")

exports.handler = async function (event) {
  const { q, startIndex = "0", maxResults = "20" } = event.queryStringParameters || {}

  if (!q || !q.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing query parameter: q" }) }
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY
  const params = new URLSearchParams({
    q,
    printType: "books",
    startIndex,
    maxResults,
    ...(apiKey ? { key: apiKey } : {}),
  })

  const url = `https://www.googleapis.com/books/v1/volumes?${params.toString()}`

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: { "Content-Type": "application/json" },
          body: data,
        })
      })
    }).on("error", () => {
      resolve({
        statusCode: 502,
        body: JSON.stringify({ error: "Failed to reach Google Books API" }),
      })
    })
  })
}
