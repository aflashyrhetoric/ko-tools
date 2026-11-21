import { Link } from 'react-router'
import { TOOLS } from '../tools'

export default function HomePage() {
  return (
    <main className="app">
      <header>
        <h1>ko-tools</h1>
        <p className="sub">A small collection of personal calculators.</p>
      </header>

      <ul className="tool-list">
        {TOOLS.map((t) => (
          <li key={t.path}>
            <Link to={`/${t.path}`} className="tool-card">
              <span className="tool-title">{t.title}</span>
              <span className="tool-desc">{t.description}</span>
              <span className="tool-path">/{t.path} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
