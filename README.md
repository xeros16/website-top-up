# Mikoo Store

Demo top-up game untuk portofolio PIR Visuals. Katalog berisi enam game dengan nominal dan harga contoh dalam rupiah. Pesanan dapat dicek kembali di browser yang sama. Semua metode pembayaran berupa simulasi dan tidak menarik dana, meminta data kartu, atau menampilkan QR pembayaran aktif.

## Menjalankan proyek

Gunakan Node.js 22.12+ atau Node.js 24 LTS dan npm.

```sh
npm ci
npm run dev
```

Buka alamat lokal yang dicetak Vite. Untuk memeriksa tipe, membuat build, dan melihat hasilnya:

```sh
npm run typecheck
npm run build
npm run preview
```

Build ada di `dist/`. Navigasi memakai hash, sehingga situs dapat dipasang di hosting statis tanpa aturan rewrite dan bisa berjalan dari subdirektori.

## Mencoba pembayaran demo

1. Cari **Mobile Legends** atau pilih kategori **MOBA**, lalu buka produknya.
2. Masukkan User ID `0012345678` dan Zone ID `0123`. Untuk produk dengan satu kolom, coba Free Fire dengan ID Pemain `0012345678`.
3. Pilih nominal dan metode pembayaran. Cek data dan total di **Ringkasan pesanan**, lalu pilih **Simulasikan pembayaran**.
4. Pesanan dimulai dengan status **Menunggu pembayaran**. Di bawah **Skenario simulasi**, pilih **Berhasil** untuk menyelesaikan demo atau **Gagal** untuk melihat cara mencoba kembali. Pilih **Menunggu pembayaran** untuk mengatur ulang skenario.
5. Salin kode `MKO-…`, buka **Cek pesanan**, lalu masukkan kode tersebut. Muat ulang untuk memeriksa status yang tersimpan.

Penyimpanan browser memuat kode pesanan, game, nominal, metode, rincian harga, dan status. ID pemain hanya dipakai selama mengisi checkout. Menghapus data situs, pindah browser, atau membuka mode privat menyebabkan kode dari sesi awal tidak ditemukan.

## Mengubah katalog dan merek

| Lokasi | Pengaturan |
| --- | --- |
| [src/catalog.ts](src/catalog.ts) | Nama merek, studio, daftar game, aturan ID, nominal, harga contoh, dan biaya metode bayar |
| [src/styles.css](src/styles.css) | Token warna burgundy dan putih hangat, font, serta aturan tata letak |
| [index.html](index.html) | Judul halaman, deskripsi, dan warna bilah browser |
| [public/images](public/images) | Ilustrasi konsol dan sampul katalog dalam WebP |

## Desain dan referensi

- Katalog menempatkan pencarian, kategori, dan harga awal dalam layar pertama ponsel. Checkout menempatkan ringkasan di samping formulir pada desktop dan sesudah pilihan metode bayar pada ponsel. Taste dan antislop digunakan untuk menyaring hierarki, keterbacaan, teks, dan gerak antarmuka.
- Dokumentasi Tailwind ditinjau melalui sumber resmi di GitHub. Integrasi menggunakan plugin Vite dan satu impor CSS, sehingga build tetap memakai pipeline Vite. [Panduan Tailwind untuk Vite](https://tailwindcss.com/docs/installation/using-vite)
- Tutorial W3C WAI ditinjau melalui sumber resminya. Pesan kesalahan ditempatkan dekat kolom, dihubungkan dengan `aria-describedby`, dan fokus berpindah ke kolom pertama yang perlu diperbaiki. [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/notifications/)
- Halaman Codashop tidak dapat diakses dari jaringan cloud. Urutan data pemain, nominal, metode bayar, dan ringkasan diambil dari brief proyek. [Halaman referensi Codashop](https://www.codashop.com/id-id/mobile-legends)

## Sumber aset

- Sampul konsol dan enam ilustrasi katalog dibuat untuk proyek ini dengan OpenAI ImageGen. Nama game merujuk pada judul masing-masing. Ilustrasi demo bersifat orisinal dan tidak memakai logo maupun materi pemasaran resmi.
- Manrope dan Playfair Display dipasang serta di-host lokal melalui Fontsource. Keduanya berlisensi SIL Open Font License 1.1. [Manrope](https://fontsource.org/fonts/manrope) · [Playfair Display](https://fontsource.org/fonts/playfair-display)
- Ikon memakai Phosphor Icons yang berlisensi MIT. [Phosphor Icons](https://phosphoricons.com/)

## Verifikasi

```sh
npx playwright install chromium
npm run build
npm test
```

Untuk memakai Chromium yang sudah terpasang, atur `CHROMIUM_PATH` ke jalur binernya. Untuk menghasilkan screenshot, atur `MIKOO_CAPTURE_DIR` ke folder keluaran yang diinginkan.

`npm ci`, `npm run typecheck`, dan `npm run build` lulus. Sembilan tes Playwright lulus di Chromium 156. Cakupan mencakup:

- Pencarian dan kategori yang bekerja bersamaan, hasil kosong, reset, serta navigasi produk.
- Validasi ID, nol di depan, penggantian produk, perhitungan total, dan pencegahan dua pesanan dari pengiriman berulang.
- Tiga status pembayaran demo, pencarian kode yang valid dan tidak dikenal, status setelah refresh, dan pemeriksaan bahwa ID pemain tidak tersimpan.
- Lebar 360, 390, 768, dan 1440 px, tanpa scroll horizontal, termasuk ukuran target sentuh utama dan posisi ringkasan.
- Navigasi checkout dengan keyboard, fokus terlihat, preferensi reduced motion, dan pemindaian axe tanpa temuan WCAG AA dalam tiga tampilan yang diuji. Perubahan kesalahan dan status memakai live region. Pengumuman suara pembaca layar belum diuji langsung.
- Visibilitas kolom saat tinggi viewport diperkecil telah diperiksa di Chromium. Keyboard virtual perangkat fisik belum diuji.

Screenshot [katalog desktop](docs/screenshots/katalog-1440.png), [katalog mobile](docs/screenshots/katalog-390.png), [checkout desktop](docs/screenshots/checkout-1440.png), dan [checkout mobile](docs/screenshots/checkout-390.png) direkam dari build produksi di Chromium.
