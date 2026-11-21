import { Link } from 'react-router'

// Link back to the home page, shown at the top of every tool page.
export default function BackLink() {
  return (
    <Link to="/" className="back-link">
      ← All tools
    </Link>
  )
}
