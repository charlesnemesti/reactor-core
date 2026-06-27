import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { VantaNetBackground } from './components/VantaNetBackground'
import { DocsPage } from './pages/Docs'
import { HomePage } from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <VantaNetBackground />
      <div className="relative z-10 min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </main>
        <footer className="header-surface border-t border-[var(--border-subtle)] py-6">
          <p className="page-shell text-center font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            REACTOR ($CORE) · demo preview · not financial advice
          </p>
        </footer>
      </div>
    </BrowserRouter>
  )
}
