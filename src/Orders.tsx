import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle, Clock, MagnifyingGlass, XCircle } from '@phosphor-icons/react'
import { DemoNote } from './DemoNote'
import { rupiah } from './catalog-data'
import { changeStatus, findOrder, statuses, type Order, type OrderStatus } from './order-storage'

const statusIcons = { pending: Clock, paid: CheckCircle, failed: XCircle }
const statusHelp = {
  pending: 'Pilih skenario di bawah untuk melanjutkan simulasi.',
  paid: 'Simulasi selesai. Kamu bisa kembali ke katalog untuk mencoba pesanan lain.',
  failed: 'Coba ulang dengan memilih skenario Menunggu pembayaran atau Berhasil di bawah.',
}

function Receipt({ initial }: { initial: Order }) {
  const [order, setOrder] = useState(initial)
  const [error, setError] = useState('')
  const Icon = statusIcons[order.status]

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
        <div><h2 id="receipt-title">{order.game}</h2><p className="order-code">{order.code}</p></div>
        <div className={`order-status ${order.status}`} role="status"><Icon size={18} aria-hidden="true" /> {statuses[order.status]}</div>
      </div>
      <dl className="price-list">
        <div><dt>Nominal</dt><dd>{order.nominal}</dd></div>
        <div><dt>Metode pembayaran</dt><dd>{order.method}</dd></div>
        <div><dt>Harga dasar</dt><dd>{rupiah(order.subtotal)}</dd></div>
        <div><dt>Biaya pembayaran</dt><dd>{rupiah(order.fee)}</dd></div>
        <div className="price-total"><dt>Total</dt><dd>{rupiah(order.total)}</dd></div>
      </dl>
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

function Lookup({ code }: { code: string }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(code)
  const [blankError, setBlankError] = useState(false)

  let order: Order | undefined
  let storageError = false
  if (code) {
    try {
      order = findOrder(code)
    } catch {
      storageError = true
    }
  }

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
          <h2>{storageError ? 'Pesanan tidak dapat dibaca' : 'Kode pesanan tidak ditemukan'}</h2>
          <p>{storageError ? 'Periksa izin penyimpanan situs di browser, lalu coba lagi.' : 'Periksa kembali kode dan gunakan browser yang dipakai untuk membuat pesanan.'}</p>
        </div>
      )}
      {!code && <Link to="/" className="back-link">Lihat katalog game <ArrowRight size={17} aria-hidden="true" /></Link>}
    </>
  )
}

export function Orders() {
  const { code = '' } = useParams()
  return (
    <div className="shell page order-page">
      <header className="page-title">
        <h1>Cek pesanan</h1>
        <p>Masukkan kode dari pesanan yang dibuat di browser ini.</p>
      </header>
      <DemoNote />
      <Lookup key={code} code={code} />
    </div>
  )
}
