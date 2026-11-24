import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { GameController, Receipt } from '@phosphor-icons/react'
import '@fontsource-variable/manrope'
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/playfair-display/wght-italic.css'
import './styles.css'
import { brand } from './catalog-data'
import { Catalog } from './Catalog'
import { Product } from './Product'
import { Orders } from './Orders'

function App() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#main" onClick={(event) => {
        event.preventDefault()
        document.getElementById('main')?.focus()
      }}>Ke konten utama</a>
      <header className="site-header">
        <div className="shell header-inner">
          <Link to="/" className="wordmark">
            <span className="brand-icon"><GameController weight="bold" size={22} aria-hidden="true" /></span>
            <span>{brand.wordmark[0]} <span className="wordmark-tail">{brand.wordmark[1]}</span></span>
          </Link>
          <nav aria-label="Navigasi utama">
            <NavLink to="/" end className={pathname.startsWith('/game/') ? 'catalog-current' : undefined}>Katalog</NavLink>
            <NavLink to="/pesanan"><Receipt size={18} aria-hidden="true" /> Cek pesanan</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/game/:gameId" element={<Product />} />
          <Route path="/pesanan" element={<Orders />} />
          <Route path="/pesanan/:code" element={<Orders />} />
          <Route path="*" element={<div className="shell empty"><h1>Halaman tidak ditemukan</h1><Link to="/" className="button primary">Kembali ke katalog</Link></div>} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="shell footer-inner"><span>{brand.name}</span><span>Proyek portofolio <strong>{brand.studio}</strong></span></div>
      </footer>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><HashRouter><App /></HashRouter></StrictMode>,
)
