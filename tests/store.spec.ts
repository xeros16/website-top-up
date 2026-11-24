import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function openMobileLegends(page: Page) {
  await page.goto('/')
  await page.getByRole('link', { name: /Mobile Legends/ }).click()
  await expect(page.getByRole('heading', { name: 'Mobile Legends' })).toBeVisible()
}

async function fillPlayer(page: Page) {
  await page.getByLabel('User ID', { exact: true }).fill('0012345678')
  await page.getByLabel('Zone ID', { exact: true }).fill('0123')
}

async function capture(page: Page, name: string) {
  const dir = process.env.MIKOO_CAPTURE_DIR
  if (!dir) return
  await mkdir(dir, { recursive: true })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: join(dir, name), fullPage: true, animations: 'disabled' })
}

test('pencarian, kategori, dan keadaan kosong', async ({ page }) => {
  await page.goto('/')
  const games = page.locator('.game-grid > li')
  await expect(games).toHaveCount(6)
  const search = page.getByRole('textbox', { name: 'Cari game' })
  await search.fill('mobile')
  await expect(games).toHaveCount(2)
  await page.getByRole('button', { name: 'MOBA', exact: true }).click()
  await expect(games).toHaveCount(1)
  await expect(games.first()).toContainText('Mobile Legends')
  await page.getByRole('button', { name: 'RPG', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Game tidak ditemukan' })).toBeVisible()
  await page.getByRole('button', { name: 'Hapus pencarian dan filter' }).click()
  await expect(search).toHaveValue('')
  await expect(search).toBeFocused()
  await expect(games).toHaveCount(6)
})

test('validasi ID, nol di depan, dan ganti game', async ({ page }) => {
  await openMobileLegends(page)
  const userId = page.getByLabel('User ID', { exact: true })
  await userId.fill('AB12')
  await page.getByRole('button', { name: 'Simulasikan pembayaran' }).click()
  await expect(userId).toBeFocused()
  await expect(page.getByText('Gunakan angka saja untuk User ID.')).toBeVisible()
  await expect(page.getByText('Masukkan Zone ID.')).toBeVisible()
  await fillPlayer(page)
  await expect(userId).toHaveValue('0012345678')
  await expect(page.getByLabel('Zone ID', { exact: true })).toHaveValue('0123')
  await page.getByRole('radio', { name: /296 Diamonds/ }).check()
  await page.evaluate(() => { location.hash = '/game/free-fire' })
  await expect(page.getByRole('heading', { name: 'Free Fire' })).toBeVisible()
  await expect(page.getByLabel('ID Pemain')).toHaveValue('')
  await expect(page.getByLabel('Zone ID', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('radio', { name: /^50 Diamonds/ })).toBeChecked()
})

test('total, pengiriman ganda, status, refresh, dan pencarian pesanan', async ({ page }) => {
  await openMobileLegends(page)
  await fillPlayer(page)
  const total = page.locator('.price-total')
  await expect(total).toContainText('Rp 5.000')
  await page.getByRole('radio', { name: /59 Diamonds/ }).check()
  await expect(total).toContainText('Rp 17.000')
  await page.getByRole('radio', { name: /Transfer bank/ }).check()
  await expect(total).toContainText('Rp 18.000')
  await page.getByRole('button', { name: 'Simulasikan pembayaran' }).evaluate((button) => {
    const form = (button as HTMLButtonElement).form!
    form.requestSubmit()
    form.requestSubmit()
  })
  await expect(page.getByRole('heading', { name: 'Cek pesanan' })).toBeVisible()
  const code = (await page.locator('.order-code').textContent())!
  expect(code).toMatch(/^MKO-[0-9A-F]{12}$/)
  const saved = await page.evaluate(() => localStorage.getItem('mikoo-store.orders.v1')!)
  expect(JSON.parse(saved)).toHaveLength(1)
  expect(saved).not.toContain('0012345678')
  expect(saved).not.toContain('0123')
  await expect(page.getByText('Mode demo.')).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('Menunggu pembayaran')
  await expect(total).toContainText('Rp 18.000')
  await page.getByRole('button', { name: 'Gagal', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Gagal')
  await expect(page.getByText(/Coba ulang dengan memilih/)).toBeVisible()
  await page.getByRole('button', { name: 'Berhasil', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Berhasil')
  await page.reload()
  await expect(page.getByRole('status')).toHaveText('Berhasil')
  await page.getByRole('button', { name: 'Menunggu pembayaran', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Menunggu pembayaran')
  await page.getByRole('navigation').getByRole('link', { name: 'Cek pesanan' }).click()
  const lookup = page.getByLabel('Kode pesanan')
  await lookup.fill('MKO-TIDAKADA')
  await page.getByRole('button', { name: 'Cek pesanan', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Kode pesanan tidak ditemukan' })).toBeVisible()
  await lookup.fill(code.toLowerCase())
  await page.getByRole('button', { name: 'Cek pesanan', exact: true }).click()
  await expect(page.locator('.receipt')).toContainText('59 Diamonds')
  await expect(page.locator('.receipt')).toContainText('Rp 18.000')
})

test('riwayat membuka pesanan lama dan baru serta menyalin kode', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#/pesanan')
  const history = page.getByRole('region', { name: 'Riwayat pesanan' })
  await expect(history.getByText('Belum ada pesanan di browser ini.')).toBeVisible()

  await page.evaluate(() => {
    localStorage.setItem('mikoo-store.orders.v1', JSON.stringify([{
      code: 'MKO-A1B2C3D4E5F6', game: 'Free Fire', nominal: '50 Diamonds', method: 'Dompet digital',
      subtotal: 8000, fee: 1500, total: 9500, status: 'failed',
    }]))
  })

  await openMobileLegends(page)
  await fillPlayer(page)
  await page.getByRole('button', { name: 'Simulasikan pembayaran' }).click()
  await expect(page.getByRole('heading', { name: 'Cek pesanan' })).toBeVisible()
  const code = (await page.locator('.receipt .order-code').textContent())!
  await page.getByRole('button', { name: 'Salin kode' }).click()
  await expect(page.getByText('Kode pesanan disalin.')).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code)
  await page.getByRole('button', { name: 'Berhasil', exact: true }).click()
  await page.getByRole('link', { name: 'Kembali ke riwayat' }).click()
  await page.reload()

  const entries = history.getByRole('link')
  await expect(entries).toHaveCount(2)
  await expect(entries.nth(0)).toContainText('Mobile Legends')
  await expect(entries.nth(0)).toContainText('Berhasil')
  await expect(entries.nth(0)).toContainText('Rp 5.000')
  await expect(entries.nth(1)).toContainText('MKO-A1B2C3D4E5F6')
  await expect(entries.nth(1)).toContainText('Gagal')
  await page.setViewportSize({ width: 1440, height: 900 })
  await capture(page, 'riwayat-1440.png')
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  await capture(page, 'riwayat-390.png')
  await entries.nth(1).click()
  await expect(page.getByRole('heading', { name: 'Free Fire' })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('Gagal')
})

test('pesanan bisa disalin manual saat browser menolak clipboard', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, 'writeText', {
      value: async () => { throw new DOMException('Permission denied', 'NotAllowedError') },
    })
  })
  await openMobileLegends(page)
  await fillPlayer(page)
  await page.getByRole('button', { name: 'Simulasikan pembayaran' }).click()
  await page.getByRole('button', { name: 'Salin kode' }).click()
  await expect(page.getByText(/Pilih teks kode lalu salin secara manual/)).toBeVisible()
  await expect(page.locator('.receipt .order-code')).toHaveText(/^MKO-[0-9A-F]{12}$/)
})

test('pesan lagi memakai harga katalog dan meminta ID baru', async ({ page }) => {
  await openMobileLegends(page)
  await page.evaluate(() => {
    localStorage.setItem('mikoo-store.orders.v1', JSON.stringify([{
      code: 'MKO-A1B2C3D4E5F6', game: 'Mobile Legends', nominal: '59 Diamonds', method: 'Transfer bank',
      subtotal: 9000, fee: 1000, total: 10000, status: 'paid',
    }]))
  })
  await page.goto('/#/pesanan/MKO-A1B2C3D4E5F6')
  await expect(page.locator('.price-total')).toContainText('Rp 10.000')
  await page.getByRole('link', { name: 'Pesan lagi' }).click()
  await expect(page.getByLabel('User ID', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Zone ID', { exact: true })).toHaveValue('')
  await expect(page.getByRole('radio', { name: /^59 Diamonds/ })).toBeChecked()
  await expect(page.getByRole('radio', { name: /Transfer bank/ })).toBeChecked()
  await expect(page.locator('.price-total')).toContainText('Rp 18.000')
  await fillPlayer(page)
  await page.getByRole('button', { name: 'Simulasikan pembayaran' }).click()
  await expect(page.getByRole('status')).toHaveText('Menunggu pembayaran')
  await expect(page.locator('.order-code')).not.toHaveText('MKO-A1B2C3D4E5F6')
  await page.getByRole('link', { name: 'Pesan lagi' }).click()
  await expect(page.getByRole('radio', { name: /^59 Diamonds/ })).toBeChecked()
  await expect(page.getByLabel('User ID', { exact: true })).toHaveValue('')
})

test('checkout dan simulasi dengan keyboard', async ({ page }) => {
  await page.goto('/#/game/mobile-legends')
  const userId = page.getByLabel('User ID', { exact: true })
  await expect(userId).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ke konten utama' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /Kembali ke katalog/ })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(userId).toBeFocused()
  expect(await userId.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe('2px')
  await page.keyboard.type('0012345678')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Zone ID', { exact: true })).toBeFocused()
  await page.keyboard.type('0123')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('radio', { name: /12 Diamonds/ })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: /28 Diamonds/ })).toBeChecked()
  await page.keyboard.press('Tab')
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: /Transfer bank/ })).toBeChecked()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /Simulasikan pembayaran/ })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toHaveText('Menunggu pembayaran')
  await expect(page.locator('.price-total')).toContainText('Rp 10.500')
})

for (const width of [360, 390, 768, 1440]) {
  test(`tata letak katalog dan checkout pada ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 390 ? 844 : 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const search = page.getByLabel('Cari game')
    const game = page.getByRole('link', { name: /Mobile Legends/ })
    await expect(search).toBeInViewport()
    await expect(game).toBeInViewport()
    expect((await search.boundingBox())!.height).toBeGreaterThanOrEqual(42)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    expect(await page.locator('.hero-art').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
    if (width === 390 || width === 1440) await capture(page, `katalog-${width}.png`)

    await game.click()
    await expect(page.locator('.summary .price-total')).toContainText('Rp 5.000')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    const firstInput = page.getByLabel('User ID', { exact: true })
    expect((await firstInput.boundingBox())!.height).toBeGreaterThanOrEqual(44)

    const steps = (await page.locator('.checkout-steps').boundingBox())!
    const summary = (await page.locator('.summary').boundingBox())!
    if (width === 1440) expect(summary.x).toBeGreaterThan(steps.x + steps.width)
    else expect(summary.y).toBeGreaterThanOrEqual(steps.y + steps.height)

    if (width === 390 || width === 1440) await capture(page, `checkout-${width}.png`)
    if (width <= 390) {
      await page.setViewportSize({ width, height: 360 })
      await firstInput.focus()
      await firstInput.scrollIntoViewIfNeeded()
      await expect(firstInput).toBeInViewport({ ratio: 1 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    }
  })
}

test('axe WCAG AA pada katalog, checkout, dan pesanan', async ({ page }) => {
  async function scan() {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(results.violations).toEqual([])
  }
  await page.goto('/')
  await scan()
  await page.getByRole('link', { name: /Mobile Legends/ }).click()
  await fillPlayer(page)
  await scan()
  await page.getByRole('button', { name: 'Simulasikan pembayaran' }).click()
  await expect(page.getByRole('status')).toHaveText('Menunggu pembayaran')
  await scan()
  await page.getByRole('link', { name: 'Kembali ke riwayat' }).click()
  await expect(page.getByRole('region', { name: 'Riwayat pesanan' })).toBeVisible()
  await scan()
})
