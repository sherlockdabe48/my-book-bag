import "@testing-library/jest-dom"

// Suppress React act() warnings caused by async axios-mock-adapter promise resolution
const originalError = console.error.bind(console)
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) return
    originalError(...args)
  }
})
afterAll(() => {
  console.error = originalError
})
