import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CommandPanel } from './components/CommandPanel'
import { Header } from './components/Header'
import { PageScan } from './components/PageScan'
import { ScrollReactorOrb } from './components/ScrollReactorOrb'
import { VantaNetBackground } from './components/VantaNetBackground'
import { DataModeProvider } from './context/DataModeContext'
import { ReactorProvider } from './context/ReactorContext'
import { RouteTransitionProvider } from './context/RouteTransitionContext'
import { WalletProvider } from './context/WalletProvider'
import { DocsPage } from './pages/Docs'
import { HomePage } from './pages/Home'

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <RouteTransitionProvider>
          <DataModeProvider>
            <ReactorProvider>
            <VantaNetBackground />
            <ScrollReactorOrb />
            <PageScan />
            <div className="relative z-10 min-h-screen">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/docs" element={<DocsPage />} />
                </Routes>
              </main>
              <footer className="page-shell py-8 pb-24 sm:pb-8">
                <CommandPanel scanline={false} className="py-4 text-center">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    REACTOR ($REACTOR) · demo preview · not financial advice
                  </p>
                </CommandPanel>
              </footer>
            </div>
            </ReactorProvider>
          </DataModeProvider>
        </RouteTransitionProvider>
      </BrowserRouter>
    </WalletProvider>
  )
}
