# Investigasi kesiapan production LuminaWall

Tanggal: 9 Oktober 2026 (Asia/Jakarta). Commit yang diperiksa: `7ae428d` pada `main`.

**Keputusan audit: belum siap untuk rilis production umum.** Build berhasil, tetapi komputasi utama masih membekukan UI, kontrol mobile terpotong, beberapa alur produk masih placeholder, dan dependency production memiliki advisory keamanan. Fondasi generator client-side dan pemisahan engine/UI sudah tersedia; pekerjaan berikutnya perlu berfokus pada stabilitas, alur penggunaan, dan identitas produk.

## Bukti dan batas pemeriksaan

- `npm run build`: berhasil menggunakan Next.js 15.5.20. Ketiga halaman utama diprerender statis. Ada warning cache webpack tentang kegagalan snapshot dependency; warning ini tidak menggagalkan build.
- Type-check pada pemeriksaan sebelumnya: `tsc --noEmit` berhasil.
- `npm run lint` pada pemeriksaan sebelumnya: meminta konfigurasi ESLint interaktif dan keluar dengan kode 1. Belum ada hasil lint yang bersih.
- `npm audit` dan `npm audit --omit=dev`: keduanya melaporkan 5 paket, yaitu 1 critical dan 4 high. Ini jumlah paket yang ditandai, bukan jumlah semua advisory atau bukti bahwa setiap advisory dapat dieksploitasi melalui fitur aplikasi ini.
- Versi environment yang teramati: Node.js 25.8.1, React/React DOM 19.2.7, TypeScript 5.9.3, Tailwind 4.3.2. `npm ls` juga menampilkan `@emnapi/runtime` sebagai extraneous.
- Inspeksi browser memakai hasil build production lokal pada desktop 1440×900, mobile 390×844, dan mobile pendek 390×667.
- Benchmark memakai kode TypeScript engine asli yang ditranspilasi ke CommonJS, dijalankan di Node, dan mock Canvas. Angka mengukur komputasi dan alokasi ImageData, tanpa biaya paint/copy/PNG browser. Setiap ukuran diukur satu kali; angka bukan SLA atau hasil uji seluruh perangkat.
- Uji end-to-end unduh melalui tombol bilah mobile tidak selesai; otomasi tersangkut dan event download tidak teramati. Ini tidak membuktikan encoder PNG gagal. Tombol unduh yang keluar dari viewport adalah masalah UI yang terkonfirmasi.
- Belum dilakukan uji iPhone/Safari fisik, Android berdaya rendah, deployment publik, ataupun instalasi bersih dependency dengan `npm ci`.
- Investigasi tidak mengubah source aplikasi. Build memperbarui artifact yang diabaikan Git. Perubahan lokal `.claude/settings.local.json` sudah ada sebelum investigasi.

## Temuan yang harus diselesaikan sebelum rilis

### 1. P0 — Dependency production memiliki advisory critical

Next.js yang benar-benar terpasang adalah **15.5.20**, meskipun package.json mencantumkan rentang `^15.3.4`. Audit runtime menandai `next` critical dan `nanoid`, `postcss`, `sharp`, serta `source-map-js` high.

Advisory resmi Next.js [GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36) menjelaskan risiko remote code execution pada server dengan filesystem Windows untuk versi sebelum 15.5.24. Dampak ini bergantung pada OS server deployment; Windows pada laptop pengembang tidak otomatis berarti deployment Vercel/Linux terkena kasus Windows tersebut. Advisory [GHSA-4jqv-mc3x-m676](https://github.com/vercel/next.js/security/advisories/GHSA-4jqv-mc3x-m676) juga menandai cache poisoning pada konfigurasi self-hosted tertentu, dengan perbaikan pada 15.5.27.

Perbaikan: pilih versi patch yang mencakup advisory relevan beserta pembaruan dependency transitif, perbarui lockfile, lalu verifikasi audit, build, dan alur browser. Jangan menganggap satu pembaruan versi Next saja otomatis menyelesaikan seluruh paket yang ditandai. Catat platform hosting yang benar-benar digunakan.

### 2. P1 — Rendering Flow membekukan thread UI

Sumber: [WallpaperStudio.tsx](D:/LuminaWall/components/WallpaperStudio.tsx:65), [drawFlow](D:/LuminaWall/lib/wallpaper.ts:369), [renderWallpaper](D:/LuminaWall/lib/wallpaper.ts:2427).

Studio langsung memulai Flow pada Desktop 4K saat mount. Setiap perubahan gaya, palet, resolusi, tone, atau seed menggambar ulang pada resolusi ekspor penuh. `requestAnimationFrame` menunda awal pekerjaan, tetapi seluruh loop piksel tetap bekerja sinkron pada thread utama.

| Ukuran | Piksel | Komputasi Flow terukur | Satu buffer ImageData |
| --- | ---: | ---: | ---: |
| 960×540 | 518.400 | 0,490 detik | 2,0 MiB |
| 1920×1080 | 2.073.600 | 1,918 detik | 7,9 MiB |
| 3840×2160 | 8.294.400 | 7,737 detik | 31,6 MiB |
| 7680×4320 | 33.177.600 | 32,054 detik | 126,6 MiB |
| 10240×4320 | 44.236.800 | 41,552 detik | 168,8 MiB |

Pada 10K, ImageData dan backing store Canvas saja kira-kira membutuhkan 338 MiB jika keduanya memakai RGBA 8-bit penuh, sebelum salinan browser dan memori lain. Studio tidak menyediakan status rendering, pembatalan pekerjaan berjalan, atau penanganan kegagalan kanvas. Klaim rendering "instan" tidak didukung oleh pengukuran ini.

Perbaikan: gunakan preview terbatas resolusinya; render resolusi ekspor saat pengguna mengunduh. Pindahkan komputasi berat ke Web Worker dan OffscreenCanvas jika didukung, serta sediakan fallback yang tetap memberi kesempatan UI merespons. Beri identitas setiap job agar hasil pekerjaan lama tidak menimpa pilihan terbaru, tampilkan status, dan sediakan pembatalan serta batas resolusi sesuai kemampuan perangkat. Jaga kecocokan komposisi preview dan ekspor melalui seed dan koordinat yang konsisten.

### 3. P1 — Indeks density Attractor rusak pada ukuran piksel pecahan

Sumber: [AttractorLab.tsx](D:/LuminaWall/components/AttractorLab.tsx:53), [renderDensity](D:/LuminaWall/lib/attractor.ts:181).

`window.innerWidth * devicePixelRatio` bisa menghasilkan angka pecahan pada zoom/skala layar. Canvas menormalkan atribut width menjadi integer, tetapi renderer tetap memakai parameter width pecahan untuk indeks `py * width + px`. Indeks pecahan tidak menjadi elemen valid pada Uint32Array.

Reproduksi memakai orbit yang sama: width 101 dan height 100 menghasilkan 2 piksel menyala; width 101,25 dan height 100 menghasilkan 0 piksel menyala. Kedua canvas memiliki atribut width 101. Ini bug terkonfirmasi pada engine, bukan dugaan dari tampilan screenshot.

Perbaikan: normalisasi width/height ke integer positif sebelum alokasi, scaling, dan pengindeksan, lalu gunakan nilai yang sama pada seluruh operasi. Uji DPR/zoom pecahan serta perubahan viewport.

### 4. P1 — Bilah mobile meluber dan kontrol studio terduplikasi

Sumber: [WallpaperStudio.tsx](D:/LuminaWall/components/WallpaperStudio.tsx:118), [bilah mobile](D:/LuminaWall/components/WallpaperStudio.tsx:223).

Panel yang dikomentari sebagai panel desktop tetap ditampilkan di mobile karena tidak memiliki aturan `hidden lg:flex`. Pada viewport mobile ada dua tombol Buat Wallpaper yang terlihat, panel panjang, serta bilah aksi yang berulang. Bilah bawah memuat label Indonesia panjang, beberapa tombol, dan jarak antartombol dalam satu baris.

Pada viewport 390 px, lebar client yang teramati adalah 375 px setelah scrollbar, tetapi scrollWidth dokumen mencapai 398 px. Screenshot menunjukkan label Resolusi Layar terpotong dan tombol unduh di kanan keluar dari area layar.

Perbaikan: tampilkan satu sistem kontrol mobile. Batasi bilah ke aksi utama dan tombol pengaturan; tempatkan pilihan gaya/palet/resolusi dalam satu drawer dengan tab yang sesuai. Tetapkan ukuran minimum target sentuh dan uji kedua bahasa pada 320–430 px. Gunakan min-width/shrink dan safe-area yang sesuai, lalu pastikan tidak ada overflow horizontal.

### 5. P1 — Panel lab menghilangkan aksi pada layar pendek

Sumber: [LSystemLab.tsx](D:/LuminaWall/components/LSystemLab.tsx:91), [AttractorLab.tsx](D:/LuminaWall/components/AttractorLab.tsx:104).

Lab menggunakan `h-screen overflow-hidden` dengan panel absolut yang tidak memiliki batas tinggi dan scroll internal. Pada L-System 390×667, panel berakhir pada y≈807, sedangkan tombol Download berada pada y≈745–786; seluruh tombol berada di bawah viewport. Attractor juga memakai pola panel serupa.

Perbaikan: beri panel batas tinggi berdasarkan viewport dinamis dan scroll internal; letakkan aksi utama pada area yang tetap terjangkau. Untuk mobile, drawer yang bisa diciutkan juga akan membuat artwork lebih mudah dilihat. Ekspor kedua lab saat ini mengikuti ukuran viewport/DPR, sehingga belum menawarkan resolusi perangkat seperti studio utama.

### 6. P1 — Kegagalan pekerjaan async tidak dipulihkan

Sumber: [callback rendering studio](D:/LuminaWall/components/WallpaperStudio.tsx:72), [render Attractor](D:/LuminaWall/components/AttractorLab.tsx:43), [downloadCanvas](D:/LuminaWall/lib/wallpaper.ts:2444), [error page](D:/LuminaWall/app/error.tsx:9).

Rendering studio dipanggil dari callback requestAnimationFrame tanpa try/catch. Attractor memakai async render dengan `setBusy(true)`, tetapi tidak memakai catch/finally. Jika alokasi atau rendering gagal, promise dapat ditolak dan indikator busy tidak dipulihkan. Error boundary React tidak menangkap error yang dilempar dari callback async biasa ini. `getContext` atau `toBlob` yang menghasilkan null juga dihentikan tanpa pesan kepada pengguna.

Perbaikan: gunakan status job yang jelas (idle/rendering/exporting/error), tangkap kegagalan pada sumbernya, pulihkan state dengan finally, dan tampilkan opsi retry pada resolusi lebih rendah. Download perlu memakai snapshot pekerjaan yang sudah selesai dan nama file yang cocok dengan parameter gambar tersebut.

## Masalah desain dan produk

| Temuan | Dampak | Perbaikan yang disarankan |
| --- | --- | --- |
| Hero, workspace setinggi hampir satu layar, iklan, affiliate, dan Pro berada pada satu halaman | Halaman terasa seperti dashboard teknis; aksi dan manfaat produk bersaing, tombol unduh desktop berada jauh di bawah lipatan awal | Buat landing page ringkas dengan galeri contoh dan CTA menuju studio; gunakan workspace tersendiri dengan fokus pada preview dan pembuatan wallpaper |
| 22 gaya, 20 palet, dan 11 resolusi ditawarkan sekaligus | Pengguna baru harus memindai banyak pilihan sebelum memahami hasil | Mulai dengan beberapa preset kurasi, thumbnail gaya, pencarian/kategori, serta pilihan lanjutan yang dapat dibuka |
| Informasi journal, panel display, dan PPI mendominasi pengaturan | Detail teknis mengganggu tugas memilih tampilan dan mengunduh | Tampilkan dimensi ekspor dengan jelas; pindahkan informasi riset/perangkat ke detail opsional |
| Logo adalah ikon Aperture dari Lucide | Belum ada identitas visual khusus LuminaWall | Buat simbol vektor yang khas, wordmark, versi monokrom, dan aturan ukuran/penggunaan |
| public hanya memuat manifest.json; favicon.ico mengembalikan 404 | Identitas tab dan icon aplikasi belum tersedia | Tambahkan favicon, apple-touch icon, icon 192/512, dan gambar share; tautkan manifest bila memang akan dipakai |
| Pro menjanjikan 8K meski 8K dan 10K tersedia gratis; daftar tunggu hanya alert | Janji produk tidak konsisten dan CTA tidak menyelesaikan tugas | Tentukan fitur gratis/Pro, lalu gunakan alur nyata atau status coming soon yang jelas |
| Semua affiliate masih href="#"; banner dan interstitial masih placeholder | Tautan tidak menuju produk dan tampilan terasa belum selesai | Sembunyikan slot yang belum aktif atau integrasikan layanan yang benar-benar berfungsi sebelum menampilkannya |

Arah desain yang disarankan: karakter editorial yang menonjolkan artwork, contoh wallpaper yang langsung terlihat, satu CTA utama, dan studio dengan kontrol lebih sederhana. Pertahankan preview perangkat karena membantu memahami hasil ekspor. Landing page dapat memakai contoh statis yang sudah dioptimalkan agar tidak menjalankan Flow 4K saat pertama dibuka.

Arah identitas: simbol sederhana yang menggabungkan bidang cahaya dan bingkai wallpaper, dengan bentuk yang tetap terbaca pada favicon 16–32 px. Paket minimum berupa simbol SVG, wordmark SVG, versi gelap/terang, favicon, apple-touch icon, dan gambar Open Graph. Ini arah rekomendasi desain, bukan logo yang sudah dibuat.

## Aksesibilitas, bahasa, dan metadata

- Interstitial memiliki aria-modal tetapi tidak memindahkan atau menjebak fokus. Uji browser memperlihatkan fokus tetap pada Buat Wallpaper di belakang dialog, tombol latar tetap aktif, dan tombol Continue langsung aktif. Konstanta hitung mundur 3 detik tidak digunakan. Drawer mobile juga belum memiliki dialog semantics/focus management. Sumber: [AdInterstitial.tsx](D:/LuminaWall/components/AdInterstitial.tsx:19).
- Kontrol yang memakai role radio belum menerapkan navigasi panah dan roving tabindex. Ring fokus tersedia, tetapi semantics saja belum memenuhi pola interaksi radio group. Sumber: [SegmentedControl.tsx](D:/LuminaWall/components/ui/SegmentedControl.tsx:42).
- Token teks faint `#5b6272` memiliki rasio kontras sekitar 3,26:1 terhadap abyss dan 3,11:1 terhadap carbon. Label kecil yang memakai token ini perlu diperjelas; angka berasal dari token warna dasar, bukan pengukuran seluruh komposisi glass/gradient.
- Bahasa awal aplikasi adalah Indonesia, sedangkan atribut html.lang selalu en. Label Palette dan seluruh lab masih English; referensi perangkat diterjemahkan sebagai "Referensi HP" termasuk untuk monitor/laptop. Sumber: [i18n.tsx](D:/LuminaWall/lib/i18n.tsx:82), [layout.tsx](D:/LuminaWall/app/layout.tsx:60), [PaletteSelector.tsx](D:/LuminaWall/components/PaletteSelector.tsx:18).
- HTML hasil build tidak memiliki link canonical, icon, manifest, atau og:image. Metadata Twitter meminta summary_large_image tetapi tidak menyediakan gambar.
- Build lokal menghasilkan sitemap dan robots dengan origin localhost. Pada Vercel origin dapat diambil dari environment, tetapi hosting lain perlu NEXT_PUBLIC_SITE_URL yang valid. Ini risiko konfigurasi deployment, bukan bukti bahwa domain deployment yang ada salah. Sumber: [site.ts](D:/LuminaWall/lib/site.ts:10).

## Pemeliharaan dan pengujian

- Belum ada konfigurasi lint yang dapat dijalankan tanpa interaksi, script test, atau workflow CI pada file proyek yang diperiksa. Build sukses tidak menggantikan pemeriksaan runtime/responsif.
- package.json versi 0.2.0, tetapi versi root package-lock.json masih 0.1.0. README menyebut MIT dan menautkan LICENSE yang tidak tersedia. Dokumentasi dan lockfile perlu diselaraskan.
- Tidak ada engines/runtime pin pada package.json. Build lokal berhasil, tetapi reproduksi build dari install bersih pada environment deployment belum dibuktikan.
- `/wasm/attractor.wasm` mengembalikan 404. Fallback JS berjalan, sehingga ini bukan kegagalan fatal. Metadata halaman Attractor menyebut WebAssembly meski binary belum tersedia; build WASM belum menjadi bagian script build aplikasi. Menambah WASM sendiri juga tidak memindahkan komputasi dari thread UI.
- Mandala tidak sepenuhnya deterministik: dua render dengan seed 42 menghasilkan urutan perintah gambar berbeda karena randomPetalShape memakai Math.random. Micro-grain juga dibuat dari Math.random dan cache global. Sumber: [wallpaper.ts](D:/LuminaWall/lib/wallpaper.ts:565). Hal ini perlu diperbaiki sebelum mengandalkan seed untuk preview/export atau fitur share/replay.
- Error reporting saat ini berupa console.error; belum ditemukan integrasi pelaporan error/performance. Tambahkan pengukuran waktu job, kegagalan export, dan error worker agar masalah di perangkat pengguna dapat didiagnosis. Hindari mengumpulkan gambar pengguna jika tidak dibutuhkan.
- CSP saat ini hanya mengizinkan sumber self untuk beberapa jenis resource. Bila iklan pihak ketiga diaktifkan, integrasinya perlu allowlist yang spesifik dan pemeriksaan tersendiri; mengganti placeholder dengan snippet iklan saja tidak cukup.

## Urutan pengerjaan yang disarankan

1. **Stabilkan engine dan dependency:** tangani advisory; pisahkan preview dari export; pindahkan komputasi; normalisasi dimensi Attractor; tambahkan error recovery dan pembatalan.
2. **Rapikan alur studio mobile:** satu panel kontrol, bilah tanpa overflow, panel lab yang bisa discroll, serta download yang selalu terjangkau dan memberikan feedback.
3. **Tentukan desain produk:** landing page dengan contoh hasil dan CTA; studio yang terfokus; logo dan aset brand lengkap; hilangkan janji/tautan placeholder yang menyesatkan.
4. **Lengkapi kesiapan rilis:** lint noninteraktif, build dari install bersih, pengecekan route/metadata/aset, uji ekspor PNG, keyboard, DPR pecahan, mobile pendek, dan Safari/Android; tambah pelaporan error yang sesuai.

Kriteria rilis: UI tetap merespons saat render/export; pekerjaan lama tidak menimpa pilihan terbaru; PNG valid dengan dimensi yang dijanjikan; tombol utama terjangkau pada kedua bahasa; kegagalan bisa dipulihkan; dependency deployment diperiksa; seluruh CTA dan aset yang ditampilkan berfungsi.


## Release readiness follow-up

The three engine determinism failures have been fixed and all 45 current tests pass. Lightfold branding/loading is integrated. Source access is restored and local lint/typecheck/build/audit/metadata smoke checks pass. See docs/RELEASE_READINESS.md for evidence and remaining production-domain/deployment verification. GitHub has no recorded CI runs yet.
