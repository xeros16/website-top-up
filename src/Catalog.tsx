import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MagnifyingGlass, X } from '@phosphor-icons/react'
import { games, imageUrl, rupiah, type Game } from './catalog'

const categories = ['Semua game', ...new Set(games.map((game) => game.category))]

export function Cover({ game, className = '' }: { game: Game; className?: string }) {
  return <img className={'cover ' + className} src={imageUrl(`game-${game.cover + 1}.webp`)} alt="" width="360" height="360" style={{ backgroundColor: game.tone }} />
}

export function Catalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(categories[0])
  const results = games.filter((game) =>
    game.name.toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID')) &&
    (category === categories[0] || category === game.category),
  )

  function reset() {
    setQuery('')
    setCategory(categories[0])
    document.getElementById('game-search')?.focus()
  }

  return (
    <div className="shell home">
      <section className="hero" aria-labelledby="hero-title">
        <img className="hero-art" src={imageUrl('console.webp')} width="960" height="640" alt="" fetchPriority="high" />
        <div className="hero-copy">
          <h1 id="hero-title">Top up game,<br /><em>lanjut main.</em></h1>
          <p>Cari game favoritmu, bandingkan nominal, dan coba top-up dalam mode demo.</p>
        </div>
      </section>
      <section className="catalog" aria-labelledby="catalog-title">
        <h2 id="catalog-title">Pilih game kamu</h2>
        <div className="catalog-controls">
          <div className="filters" role="group" aria-label="Kategori game">
            {categories.map((name) => <button type="button" key={name} aria-pressed={name === category} onClick={() => setCategory(name)}>{name}</button>)}
          </div>
          <div className="search">
            <label htmlFor="game-search" className="sr-only">Cari game</label>
            <MagnifyingGlass size={19} aria-hidden="true" />
            <input id="game-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari game…" />
            {query && <button className="icon-button" type="button" aria-label="Hapus pencarian" onClick={() => {
              setQuery('')
              document.getElementById('game-search')?.focus()
            }}><X size={17} aria-hidden="true" /></button>}
          </div>
        </div>
        <p className="results-count" role="status">{results.length} game</p>
        {results.length ? (
          <ul className="game-grid">
            {results.map((game) => (
              <li key={game.id}>
                <Link to={`/game/${game.id}`} className="game-card">
                  <Cover game={game} />
                  <div className="game-caption">
                    <h3>{game.name}</h3>
                    <p>Mulai {rupiah(Math.min(...game.packs.map((pack) => pack.price)))}</p>
                    <ArrowRight className="card-arrow" size={19} aria-hidden="true" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <h3>Game tidak ditemukan</h3>
            <p>Coba nama lain atau tampilkan kembali semua game.</p>
            <button className="button secondary" onClick={reset}>Hapus pencarian dan filter</button>
          </div>
        )}
      </section>
    </div>
  )
}
