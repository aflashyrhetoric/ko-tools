import { Link } from 'react-router'

export default function NotFound() {
  return (
    <main className="app">
      <header>
        <h1>Page not found</h1>
        <p className="sub">
          Head back to <Link to="/">all tools</Link>.
        </p>
      </header>
    </main>
  )
}
