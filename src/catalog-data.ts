export const brand = {
  name: 'Mikoo Store',
  wordmark: ['Mikoo', 'Store'],
  studio: 'PIR Visuals',
}

export type PlayerField = {
  id: string
  label: string
  example: string
  min: number
  max: number
  hint: string
}

export type Pack = {
  id: string
  units: number
  price: number
}

export type Game = {
  id: string
  name: string
  publisher: string
  category: string
  currency: string
  cover: number
  tone: string
  fields: PlayerField[]
  packs: Pack[]
}

const playerId: PlayerField = {
  id: 'player', label: 'ID Pemain', example: '0012345678', min: 6, max: 16,
  hint: 'Salin ID dari halaman profil di dalam game.',
}

function packs(options: [units: number, price: number][]): Pack[] {
  return options.map(([units, price]) => ({ id: String(units), units, price }))
}

export const games: Game[] = [
  {
    id: 'mobile-legends', name: 'Mobile Legends', publisher: 'Moonton', category: 'MOBA',
    currency: 'Diamonds', cover: 0, tone: '#382a51',
    fields: [
      { ...playerId, label: 'User ID', max: 12, hint: 'Buka Profil. User ID ada di sebelah kiri tanda kurung.' },
      { id: 'zone', label: 'Zone ID', example: '0123', min: 4, max: 5, hint: 'Gunakan angka di dalam tanda kurung pada profil.' },
    ],
    packs: packs([[12, 3500], [28, 8000], [59, 15500], [85, 22000], [170, 43000], [296, 75000]]),
  },
  {
    id: 'free-fire', name: 'Free Fire', publisher: 'Garena', category: 'Battle Royale',
    currency: 'Diamonds', cover: 1, tone: '#64402b', fields: [playerId],
    packs: packs([[50, 8000], [70, 10000], [140, 20000], [355, 50000], [720, 98000], [1450, 195000]]),
  },
  {
    id: 'genshin-impact', name: 'Genshin Impact', publisher: 'HoYoverse', category: 'RPG',
    currency: 'Genesis Crystals', cover: 2, tone: '#416a62',
    fields: [{ ...playerId, label: 'UID', example: '081234567', min: 9, max: 10 }],
    packs: packs([[60, 16000], [300, 78000], [980, 239000], [1980, 479000]]),
  },
  {
    id: 'pubg-mobile', name: 'PUBG Mobile', publisher: 'Level Infinite', category: 'Battle Royale',
    currency: 'UC', cover: 3, tone: '#374752', fields: [playerId],
    packs: packs([[30, 8000], [60, 15000], [325, 73000], [660, 145000], [1800, 355000], [3850, 710000]]),
  },
  {
    id: 'honkai-star-rail', name: 'Honkai: Star Rail', publisher: 'HoYoverse', category: 'RPG',
    currency: 'Oneiric Shards', cover: 4, tone: '#4f345d',
    fields: [{ ...playerId, label: 'UID', example: '081234567', min: 9, max: 10 }],
    packs: packs([[60, 16000], [300, 78000], [980, 239000], [1980, 479000]]),
  },
  {
    id: 'arena-of-valor', name: 'Arena of Valor', publisher: 'Garena', category: 'MOBA',
    currency: 'Vouchers', cover: 5, tone: '#652e3b', fields: [playerId],
    packs: packs([[40, 10000], [90, 20000], [230, 50000], [470, 100000]]),
  },
]

export const paymentMethods = [
  { id: 'ewallet', label: 'Dompet digital', fee: 1500, icon: 'wallet' },
  { id: 'bank', label: 'Transfer bank', fee: 2500, icon: 'bank' },
  { id: 'qris', label: 'QRIS', fee: 1000, icon: 'qr' },
] as const

const numbers = new Intl.NumberFormat('id-ID')
export const rupiah = (value: number) => `Rp ${numbers.format(value)}`
export const packName = (game: Game, pack: Pack) => `${numbers.format(pack.units)} ${game.currency}`
export const imageUrl = (file: string) => `${import.meta.env.BASE_URL}images/${file}`
