import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bank, QrCode, Wallet } from '@phosphor-icons/react'
import { Cover } from './Catalog'
import { DemoNote } from './DemoNote'
import { games, packName, paymentMethods, rupiah, type Game, type PlayerField } from './catalog'
import { createOrder } from './orders'

const methodIcons = { wallet: Wallet, bank: Bank, qr: QrCode }

function playerError(field: PlayerField, value: string) {
  if (!value) return `Masukkan ${field.label}.`
  if (!/^\d+$/.test(value)) return `Gunakan angka saja untuk ${field.label}.`
  if (value.length < field.min || value.length > field.max) {
    const length = field.min === field.max ? field.min : `${field.min}–${field.max}`
    return `${field.label} harus berisi ${length} digit.`
  }
  return ''
}

function Checkout({ game }: { game: Game }) {
  const navigate = useNavigate()
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [packId, selectPack] = useState(game.packs[0].id)
  const [methodId, selectMethod] = useState<(typeof paymentMethods)[number]['id']>(paymentMethods[0].id)
  const pack = game.packs.find((item) => item.id === packId)!
  const method = paymentMethods.find((item) => item.id === methodId)!
  const nominal = packName(game, pack)
  const total = pack.price + method.fee
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const submitting = useRef(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = Object.fromEntries(game.fields.map((field) => [field.id, playerError(field, values[field.id] ?? '')]))
    setErrors(nextErrors)
    const invalid = game.fields.find((field) => nextErrors[field.id])
    if (invalid) {
      document.getElementById(`field-${invalid.id}`)?.focus()
      return
    }

    submitting.current = true
    setSaving(true)
    setSaveError('')
    try {
      const order = createOrder({
        game: game.name, nominal, method: method.label, subtotal: pack.price, fee: method.fee, total,
      })
      navigate(`/pesanan/${order.code}`)
    } catch {
      submitting.current = false
      setSaving(false)
      setSaveError('Pesanan tidak dapat disimpan. Izinkan penyimpanan situs di browser, lalu coba lagi.')
    }
  }

  return (
    <form className="checkout-grid" noValidate onSubmit={submit}>
      <div className="checkout-steps">
        <fieldset className="form-section">
          <legend><span className="step">1</span> Data pemain</legend>
          <div className="player-fields">
            {game.fields.map((field) => (
              <div className="field" key={field.id}>
                <label htmlFor={`field-${field.id}`}>{field.label}</label>
                <input
                  id={`field-${field.id}`} name={field.id} inputMode="numeric" autoComplete="off"
                  required placeholder={`Contoh ${field.example}`} value={values[field.id] ?? ''}
                  aria-invalid={Boolean(errors[field.id])}
                  aria-describedby={`hint-${field.id}${errors[field.id] ? ` error-${field.id}` : ''}`}
                  onChange={(event) => {
                    const value = event.target.value
                    setValues({ ...values, [field.id]: value })
                    if (errors[field.id]) setErrors({ ...errors, [field.id]: playerError(field, value) })
                  }}
                  onBlur={() => {
                    if (values[field.id]) setErrors((current) => ({ ...current, [field.id]: playerError(field, values[field.id]) }))
                  }}
                />
                <p className="field-hint" id={`hint-${field.id}`}>{field.hint}</p>
                <div aria-live="polite" className="field-error" id={`error-${field.id}`}>{errors[field.id]}</div>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend><span className="step">2</span> Pilih nominal</legend>
          <div className="pack-grid">
            {game.packs.map((option) => (
              <label className="choice" key={option.id}>
                <input type="radio" name="pack" value={option.id} checked={packId === option.id} onChange={() => selectPack(option.id)} />
                <span><strong>{packName(game, option)}</strong><small>{rupiah(option.price)}</small></span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend><span className="step">3</span> Metode pembayaran</legend>
          <div className="method-grid">
            {paymentMethods.map((option) => {
              const Icon = methodIcons[option.icon]
              return <label className="choice method" key={option.id}>
                <input type="radio" name="method" value={option.id} checked={methodId === option.id} onChange={() => selectMethod(option.id)} />
                <Icon size={21} aria-hidden="true" />
                <span><strong>{option.label}</strong><small>Biaya {rupiah(option.fee)}</small></span>
              </label>
            })}
          </div>
        </fieldset>
      </div>
      <section className="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Ringkasan pesanan</h2>
        <p className="summary-game">{game.name}</p>
        <dl className="account-summary">
          {game.fields.map((field) => <div key={field.id}><dt>{field.label}</dt><dd>{values[field.id] || 'Belum diisi'}</dd></div>)}
        </dl>
        <dl className="price-list">
          <div><dt>{nominal}</dt><dd>{rupiah(pack.price)}</dd></div>
          <div><dt>Biaya · {method.label}</dt><dd>{rupiah(method.fee)}</dd></div>
          <div className="price-total" aria-live="polite" aria-atomic="true"><dt>Total</dt><dd>{rupiah(total)}</dd></div>
        </dl>
        <button className="button primary" type="submit" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simulasikan pembayaran'} <ArrowRight size={20} aria-hidden="true" />
        </button>
        <div role="alert" className="field-error">{saveError}</div>
      </section>
    </form>
  )
}

export function Product() {
  const { gameId } = useParams()
  const game = games.find((entry) => entry.id === gameId)
  if (!game) return <div className="shell empty"><h1>Game tidak ditemukan</h1><Link to="/" className="button primary">Kembali ke katalog</Link></div>
  return (
    <div className="shell product page">
      <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" /> Kembali ke katalog</Link>
      <header className="product-head">
        <Cover game={game} />
        <div><h1>{game.name}</h1><p>{game.publisher} · {game.category}</p></div>
      </header>
      <DemoNote />
      <Checkout key={game.id} game={game} />
    </div>
  )
}
