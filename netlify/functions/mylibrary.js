const https = require("https")

// Proxy authenticated Google Books mylibrary API calls.
// The access token comes from the client's Authorization header —
// we just forward it to Google. No server-side secret needed here.

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    }

    const req = https.request(reqOptions, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => resolve({ statusCode: res.statusCode, body: data }))
    })
    req.on("error", reject)
    req.end()
  })
}

exports.handler = async function (event) {
  const authHeader = event.headers["authorization"] || event.headers["Authorization"]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { statusCode: 401, body: JSON.stringify({ error: "Missing Authorization header" }) }
  }

  // path param is the Google Books mylibrary sub-path, e.g. "bookshelves/2/volumes"
  const path = event.queryStringParameters?.path
  if (!path) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing path parameter" }) }
  }

  const url = `https://www.googleapis.com/books/v1/mylibrary/${path}`
  console.log(`[mylibrary] ${event.httpMethod} ${url}`)

  try {
    const { statusCode, body } = await fetchUrl(url, {
      method: event.httpMethod,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })
    console.log(`[mylibrary] Google status: ${statusCode}`)
    return {
      statusCode,
      headers: { "Content-Type": "application/json" },
      body,
    }
  } catch (err) {
    console.error("[mylibrary] network error:", err.message)
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Failed to reach Google Books API" }),
    }
  }
}
