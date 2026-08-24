import React from "react"

export default function WelcomeMessage() {
  return (
    <div className="welcome-message__container">
      <h1 className="welcome-message__topic">What you will read today?</h1>

      <div className="welcome-message__tip-wrapper">
        <div className="welcome-message__tip-list">
          <h4>Get Start :</h4>
          <p>1. Search your first book.</p>
          <p>2. Add the book to your "Shelf".</p>
          <p>3. Add the book you wanna read to "Bag"</p>
        </div>
      </div>
    </div>
  )
}
