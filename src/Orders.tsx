import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Copy, MagnifyingGlass, XCircle } from '@phosphor-icons/react'
import { DemoNote } from './DemoNote'
import { games, packName, paymentMethods, rupiah } from './catalog-data'
import { changeStatus, readOrders, statuses, type Order, type OrderStatus } from './order-storage'

const statusIcons = { pending: Clock, paid: CheckCircle, failed: XCircle }
const statusHelp = {
  pending: 'Pilih skenario di bawah untuk melanjutkan simulasi.',
  paid: 'Simulasi selesai. Kamu bisa kembali ke katalog untuk mencoba pesanan lain.',
  failed: 'Coba ulang dengan memilih skenario Menunggu pembayaran atau Berhasil di bawah.',
}

function StatusLabel({ status, announce = false }: { status: OrderStatus; announce?: boolean }) {
  const Icon = statusIcons[status]
  return (
    <span className={`order-status ${status}`} role={announce ? 'status' : undefined}>
      <Icon size={18} aria-hidden="true" /> {statuses[status]}
    </span>
  )
}

function Receipt({ initial }: { initial: Order }) {
  const [order, setOrder] = useState(initial)
  const [error, setError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const game = games.find((item) => order.gameId ? item.id === order.gameId : item.name === order.game)
  const pack = game?.packs.find((item) => order.packId ? item.id === order.packId : packName(game, item) === order.nominal)
  const method = paymentMethods.find((item) => order.methodId ? item.id === order.methodId : item.label === order.method)
  const selection = new URLSearchParams({ ulang: '1' })
  if (pack) selection.set('pack', pack.id)
  if (method) selection.set('method', method.id)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(order.code)
      setCopyMessage('Kode pesanan disalin.')
    } catch {
      setCopyMessage('Browser tidak mengizinkan penyalinan otomatis. Pilih teks kode lalu salin secara manual.')
    }
  }

  function simulate(status: OrderStatus) {
    try {
      setOrder(changeStatus(order.code, status))
      setError('')
    } catch {
      setError('Status tidak dapat disimpan. Periksa izin penyimpanan browser, lalu coba lagi.')
    }
  }

  return (
    <article className="receipt" aria-labelledby="receipt-title">
      <div className="receipt-head">
        <h2 id="receipt-title">{order.game}</h2>
        <StatusLabel status={order.status} announce />
      </div>
      <div className="receipt-code">
        <code className="order-code">{order.code}</code>
        <button className="button secondary" type="button" onClick={copyCode}>
          <Copy size={17} aria-hidden="true" /> Salin kode
        </button>
      </div>
      <p className="copy-feedback" aria-live="polite">{copyMessage}</p>
      <dl className="price-list">
        <div><dt>Nominal</dt><dd>{order.nominal}</dd></div>
        <div><dt>Metode pembayaran</dt><dd>{order.method}</dd></div>
        <div><dt>Harga dasar</dt><dd>{rupiah(order.subtotal)}</dd></div>
        <div><dt>Biaya pembayaran</dt><dd>{rupiah(order.fee)}</dd></div>
        <div className="price-total"><dt>Total</dt><dd>{rupiah(order.total)}</dd></div>
      </dl>
      {game && (
        <Link className="button secondary" to={`/game/${game.id}?${selection}`}>
          Pesan lagi <ArrowRight size={17} aria-hidden="true" />
        </Link>
      )}
      <div className="simulator">
        <h3>Skenario simulasi</h3>
        <p>{statusHelp[order.status]}</p>
        <div className="scenario-buttons" role="group" aria-label="Ubah status simulasi">
          {Object.entries(statuses).map(([status, label]) => (
            <button className="button secondary" type="button" aria-pressed={status === order.status} key={status} onClick={() => simulate(status as OrderStatus)}>{label}</button>
          ))}
        </div>
        <div className="field-error" role="alert">{error}</div>
      </div>
    </article>
  )
}

function OrderHistory({ orders }: { orders: Order[] | null }) {
  return (
    <section className="order-history" aria-labelledby="history-title">
      <h2 id="history-title">Riwayat pesanan</h2>
      {orders?.length ? (
        <ul className="history-list">
          {orders.map((order) => (
            <li key={order.code}>
              <Link className="history-order" to={`/pesanan/${encodeURIComponent(order.code)}`}>
                <span className="history-details">
                  <strong>{order.game}</strong>
                  <span className="history-nominal">{order.nominal} · {rupiah(order.total)}</span>
                  <code className="order-code">{order.code}</code>
                </span>
                <StatusLabel status={order.status} />
                <ArrowRight className="history-arrow" size={19} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty history-empty">
          <p>{orders ? 'Belum ada pesanan di browser ini.' : 'Riwayat tidak dapat dibaca. Periksa izin penyimpanan situs, lalu muat ulang.'}</p>
          {orders && <Link to="/" className="button secondary">Lihat katalog game <ArrowRight size={17} aria-hidden="true" /></Link>}
        </div>
      )}
    </section>
  )
}

function Lookup({ code }: { code: string }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(code)
  const [blankError, setBlankError] = useState(false)

  const [orders] = useState(() => {
    try {
      return readOrders()
    } catch {
      return null
    }
  })
  const order = orders?.find((entry) => entry.code === code.trim().toUpperCase())

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = query.trim().toUpperCase()
    setBlankError(!normalized)
    if (!normalized) {
      document.getElementById('order-search')?.focus()
      return
    }
    navigate(`/pesanan/${encodeURIComponent(normalized)}`)
  }

  return (
    <>
      <form className="lookup" noValidate onSubmit={submit}>
        <label htmlFor="order-search">Kode pesanan</label>
        <div className="lookup-controls">
          <input id="order-search" autoComplete="off" autoCapitalize="characters" spellCheck={false} required
            aria-invalid={blankError} aria-describedby="lookup-error"
            placeholder="MKO-XXXXXXXXXXXX" value={query} onChange={(event) => {
              setQuery(event.target.value)
              setBlankError(false)
            }} />
          <button className="button primary" type="submit"><MagnifyingGlass size={19} aria-hidden="true" /> Cek pesanan</button>
        </div>
        <div id="lookup-error" className="field-error" role="alert">{blankError && 'Masukkan kode pesanan.'}</div>
      </form>
      {order && <Receipt initial={order} />}
      {code && !order && (
        <div className="empty" role="status">
          <h2>{orders ? 'Kode pesanan tidak ditemukan' : 'Pesanan tidak dapat dibaca'}</h2>
          <p>{orders ? 'Periksa kembali kode dan gunakan browser yang dipakai untuk membuat pesanan.' : 'Periksa izin penyimpanan situs di browser, lalu coba lagi.'}</p>
        </div>
      )}
      {code ? (
        <Link to="/pesanan" className="back-link history-back"><ArrowLeft size={17} aria-hidden="true" /> Kembali ke riwayat</Link>
      ) : <OrderHistory orders={orders} />}
    </>
  )
}

export function Orders() {
  const { code = '' } = useParams()
  return (
    <div className="shell page order-page">
      <header className="page-title">
        <h1>Cek pesanan</h1>
        <p>Cari berdasarkan kode atau pilih pesanan dari riwayat di browser ini.</p>
      </header>
      <DemoNote />
      <Lookup key={code} code={code} />
    </div>
  )
}
