const https = require("https")

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }))
    }).on("error", reject)
  })
}

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

  const MAX_RETRIES = 3
  const RETRY_DELAY_MS = 300

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { statusCode, body } = await fetchUrl(url)
      console.log(`[search] attempt ${attempt} — Google status:`, statusCode)

      if (statusCode === 503 && attempt < MAX_RETRIES) {
        console.log(`[search] 503 received, retrying in ${RETRY_DELAY_MS}ms...`)
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
        continue
      }

      return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body,
      }
    } catch (err) {
      console.error(`[search] network error on attempt ${attempt}:`, err.message)
      if (attempt === MAX_RETRIES) {
        return {
          statusCode: 502,
          body: JSON.stringify({ error: "Failed to reach Google Books API" }),
        }
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt))
    }
  }
}
