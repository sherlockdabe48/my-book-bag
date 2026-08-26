
export default function WelcomeMessage() {
  return (
    <div className="welcome-message__container">
      <h1 className="welcome-message__topic">What will you read today?</h1>
      <div className="welcome-message__tip-wrapper">
        <ol className="welcome-message__steps">
          <li>Search for a book you love</li>
          <li>Save it to your<strong> Shelf</strong></li>
          <li>Move it to your<strong> Bag</strong> to start reading</li>
        </ol>
      </div>
    </div>
  )
}
