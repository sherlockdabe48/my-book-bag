import { useContext, useRef, useState } from "react"
import { bookBagContext } from "./App"
import type { Book } from "../types/book"
import "../css/add-manual.css"

interface AddManualBookFormProps {
  onClose: () => void
}

/** Escape characters that would break SVG attribute values or text nodes. */
function escapeSvg(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/** Build a cover SVG data URI with the app logo + title/author text. */
function makeGeneratedCover(title: string, author: string): string {
  const BG_COLORS = ["#3b4a6b", "#5c3d6b", "#2d6b4a", "#6b3d2d", "#2d4a6b", "#6b5c2d"]
  const hash = [...title].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const bg = BG_COLORS[hash % BG_COLORS.length]

  function wrapText(text: string, maxLen: number): string[] {
    const words = text.split(" ")
    const lines: string[] = []
    let current = ""
    for (const word of words) {
      if ((current + (current ? " " : "") + word).length > maxLen) {
        if (current) lines.push(current)
        current = word
      } else {
        current = current ? `${current} ${word}` : word
      }
    }
    if (current) lines.push(current)
    return lines
  }

  const titleLines  = wrapText(escapeSvg(title), 14)
  const authorLines = wrapText(escapeSvg(author), 16)

  // Logo sits in top ~120px, text below
  const titleY  = 132
  const lineH   = 20
  const authorY = titleY + titleLines.length * lineH + 10

  const titleSvg = titleLines.map((l, i) =>
    `<text x="75" y="${titleY + i * lineH}" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">${l}</text>`
  ).join("")
  const authorSvg = authorLines.map((l, i) =>
    `<text x="75" y="${authorY + i * lineH}" font-family="Georgia,serif" font-size="10" fill="#d4c9b8" text-anchor="middle">${l}</text>`
  ).join("")

  // The logo path (viewBox 0 0 460 460) scaled to fit 80×80 centred at x=35,y=18
  const logoPath = `M 211.5 22.562213464650338 C 209.85 22.785439358854315, 204.675 23.46715211302985, 200 24.07713069615152 C 156.8105375984037 29.712349323213004, 115.6818222361773 50.475588661156756, 83.08703953746752 83.09895421803537 C 51.163757650922626 115.05023011352584, 33.11977686506742 149.88237018448683, 24.342262816396897 196.5 C 21.87370643302595 209.61057402136987, 21.857220932884776 249.7030303695747, 24.314829161525424 263.21818270523977 C 34.10581834445775 317.061878694723, 60.08680849336371 360.63095700993733, 102.69429874120935 394.65740918776123 C 107.7511630488745 398.69583413449266, 112.12463092934607 402.0000000000001, 112.4131162533684 402.0000000000001 C 112.70160157739075 402.00000000000006, 115.98916714384654 403.9523157464156, 119.71881751215906 406.338479436479 C 132.33200147506048 414.4081692508577, 156.45249095204284 425.8808423813271, 157.85551130342662 424.47782202990106 C 158.09315146330405 424.24018187001656, 157.7728778490738 419.5193265514243, 157.14379216069278 413.98703243302947 C 154.8788738193137 394.06892803154017, 155.977620781479 357.91370148198973, 159.54351081405778 335.0221983491123 C 161.34921990915197 323.43031104194205, 162.4139720898428 317.42105764144077, 164.24285807849094 308.5 C 166.69778727319647 296.52518856420795, 167.03212028093873 279.09570064013997, 164.8950471911464 274.5 C 157.54908037180562 258.7027562953535, 146.27325126930347 251.55554255164125, 115 242.87389394731088 C 109.225 241.27071811316856, 99.325 239.08458202343263, 93 238.01581374789768 C 76.99395936684179 235.31118948771703, 74.30416361346633 234.37842433790004, 69.88003705138316 229.9982920916652 C 65.31560645218882 225.47925101707665, 65.48106053501343 226.46201521925934, 68.10430125112818 219.45077614505198 C 71.71293010509105 209.80585127415048, 81.91541774245536 201.82127241431462, 92.40724643259358 200.43102437225696 C 102.45191955050036 199.10002788463743, 114.74482789943835 196.51873645775768, 130.5 192.43222576262735 C 152.8214299769771 186.6425865413416, 151.24466519919815 187.19321546349863, 161.12305329734107 181.73821542709442 L 169.74610659468215 176.97643085418883 162.04941585406652 169.48642802591027 C 154.5403112105455 162.17897383380983, 150.00000000000006 155.3174602059115, 150 151.27683241518122 C 150 148.78634970371965, 154.50156605503594 144.16320301325484, 157.7108496831235 143.35772409657193 C 161.59039752043176 142.38401957202765, 191.29793697763523 146.84299340193786, 210.04002123495906 151.21210755457105 C 214.3849475420062 152.22498737944161, 214.92210066810182 152.08659595242642, 222.54002123495906 147.99162394636068 C 226.91800955573157 145.6382599989282, 232.87123782830972 142.20240481432012, 235.7694173962438 140.35639020278717 C 238.6675969641779 138.51037559125422, 241.24213716296018 137, 241.4906178379822 137.00000000000003 C 241.73909851300425 137.00000000000006, 245.44286068469452 134.92711799479005, 249.7212004417384 132.39359554397782 C 253.99954019878228 129.8600730931656, 260.425 126.23524413716942, 264 124.33842008620853 C 270.62521931469496 120.82321020117244, 273.39271747150883 119.26651245276221, 287.5 111.11983961576793 C 291.9 108.57892782709557, 303.53651734948653 102.45, 313.35892744330334 97.5 C 329.575378424921 89.3277254164395, 331.73881997534534 88.5, 336.8823973852729 88.5 C 342.8663291603822 88.5, 345.3988718870261 89.94606361387908, 347.93096385935706 94.80865169444532 C 349.49388690057503 97.81006358394819, 348.661258559347 101.36024464671495, 344.0434365349545 111.38438567405754 C 341.98719507142414 115.84797355332589, 338.61033098584994 123.55, 336.5392941225673 128.5 C 334.4682572592846 133.45, 331.28748668706913 140.875, 329.47091507319954 145 C 327.6543434593299 149.125, 324.27368479297394 157, 321.95834025907516 162.5 C 319.64299572517643 168, 316.95410874894543 174.3, 315.9830358674508 176.5 C 313.0535813321907 183.1367829854879, 305 204.10468950081477, 305 205.09488963036875 C 305 207.38271505101156, 316.4459032265282 221.14857581573833, 323.605758578015 227.47182895425334 C 339.6798450649181 241.66771879244183, 346 248.77277812033648, 346 252.6472266368637 C 346 259.9291717948598, 341.432676312316 262.5210667653333, 329.9835832630208 261.736328444455 L 322.0565393837549 261.1929967520179 325.8693902608704 266.846498376009 C 327.9664582432839 269.95592426920405, 331.61675315821685 276.1, 333.98115673849924 280.5 C 336.3455603187816 284.9, 338.6997478700303 289.03549963262094, 339.212684630163 289.689999183602 C 339.72562139029566 290.3444987345831, 343.30421280772197 297.31949873458314, 347.16511000222135 305.189999183602 C 356.8486338797246 324.93001690138954, 369.0186125660162 356.13691724123174, 373.9019451118091 373.75 C 374.5500309683357 376.0875, 375.3446703351347 377.99999999999994, 375.66781037136235 378 C 376.6862229641229 378, 386.8454674958968 366.8249402590181, 393.39525639503654 358.5 C 415.6128738209438 330.2608703705409, 430.05037062944245 296.49698207369966, 436.15542868789817 258.5 C 438.08081187000136 246.51669868576437, 437.779622709919 212.00908024001907, 435.6361011935051 199 C 430.9545136526951 170.58734003707931, 419.9805405373142 140.7327067040626, 406.63495551392396 120.10254313565002 C 404.08572998126573 116.16184367441713, 401.99999999999994 112.69935904959937, 402 112.40813285827721 C 402 112.11690666695506, 398.2919642649181 107.29343878648363, 393.7599205887068 101.68931534611846 C 367.390027031814 69.08147897909133, 337.6315578500935 47.81985536557174, 298.1837278557898 33.402703427628595 C 287.7029708143948 29.572260366190775, 278.92449861446846 27.3416403518067, 263 24.462477184567135 C 254.90876393889505 22.999574683925257, 218.26213167828072 21.647375349129568, 211.5 22.562213464650338`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="220" viewBox="0 0 150 220">
  <rect width="150" height="220" fill="${bg}"/>
  <rect x="8" y="8" width="134" height="204" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <g transform="translate(35,18) scale(0.1739)">
    <path d="${logoPath}" fill="rgba(255,255,255,0.85)" fill-rule="evenodd"/>
  </g>
  ${titleSvg}
  <line x1="25" y1="${authorY - 8}" x2="125" y2="${authorY - 8}" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>
  ${authorSvg}
</svg>`

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export default function AddManualBookForm({ onClose }: AddManualBookFormProps) {
  const { handleAddManualBook } = useContext(bookBagContext)
  const [title, setTitle]   = useState("")
  const [author, setAuthor] = useState("")
  const [pages, setPages]   = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [coverFile, setCoverFile] = useState<string>("")   // base64 data URI from upload
  const [error, setError]   = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** The resolved cover to use: uploaded file wins over URL. */
  const coverPreview = coverFile || coverUrl.trim()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === "string") {
        setCoverFile(result)
        setError("")
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required."); return }
    if (!author.trim()) { setError("Author is required."); return }

    const allPages = pages.trim()
      ? parseInt(pages.trim(), 10)
      : "N/A" as const

    if (pages.trim() && (Number.isNaN(allPages) || (allPages as number) < 1)) {
      setError("Pages must be a number greater than 0.")
      return
    }

    const book: Book = {
      id:            `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title:         title.trim(),
      author:        author.trim(),
      allPages,
      currentPage:   1,
      imageURL:      coverFile || coverUrl.trim() || makeGeneratedCover(title.trim(), author.trim()),
      description:   false,
      isbn:          false,
      status:        "onRead",
      note:          "",
      recommendedBy: "",
      lastReadAt:    "",
      startedAt:     "",
      timesRead:     0,
    }

    handleAddManualBook(book)
    onClose()
  }

  return (
    <div className="add-manual__overlay" role="dialog" aria-modal="true" aria-label="Add your own book">
      <div className="add-manual__card">
        <h3 className="add-manual__heading">Add your own book</h3>
        <p className="add-manual__sub">For books you own or can't find in search.</p>

        <form className="add-manual__form" onSubmit={handleSubmit} noValidate>
          <label className="add-manual__label" htmlFor="am-title">Title <span aria-hidden="true">*</span></label>
          <input id="am-title" className="add-manual__input" type="text" placeholder="e.g. The Midnight Library" value={title} onChange={(e) => { setTitle(e.target.value); setError("") }} autoFocus />

          <label className="add-manual__label" htmlFor="am-author">Author <span aria-hidden="true">*</span></label>
          <input id="am-author" className="add-manual__input" type="text" placeholder="e.g. Matt Haig" value={author} onChange={(e) => { setAuthor(e.target.value); setError("") }} />

          <label className="add-manual__label" htmlFor="am-pages">Pages <span className="add-manual__optional">(optional)</span></label>
          <input id="am-pages" className="add-manual__input" type="number" min={1} placeholder="e.g. 304" value={pages} onChange={(e) => { setPages(e.target.value); setError("") }} />

          <label className="add-manual__label" htmlFor="am-cover">Cover image <span className="add-manual__optional">(optional)</span></label>
          <div className="add-manual__cover-row">
            <input id="am-cover" className="add-manual__input add-manual__cover-url-input" type="url" placeholder="Paste image URL…" value={coverUrl} onChange={(e) => { setCoverUrl(e.target.value); setCoverFile(""); setError("") }} disabled={!!coverFile} />
            <button type="button" className="add-manual__upload-btn" onClick={() => fileInputRef.current?.click()}>
              {coverFile ? "Change file" : "Upload"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          </div>
          {coverPreview && (
            <div className="add-manual__cover-preview-row">
              <img className="add-manual__cover-preview" src={coverPreview} alt="Cover preview" />
              <button type="button" className="add-manual__cover-clear" aria-label="Remove cover" onClick={() => { setCoverFile(""); setCoverUrl(""); if (fileInputRef.current) fileInputRef.current.value = "" }}>✕</button>
            </div>
          )}

          {error && <p className="add-manual__error" role="alert">{error}</p>}

          <div className="add-manual__actions">
            <button type="submit" className="btn btn--primary">Add to Shelf</button>
            <button type="button" className="btn btn--normal" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
