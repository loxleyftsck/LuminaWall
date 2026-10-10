# Riset bentuk perangkat untuk preview LuminaWall

Tanggal: 10 Oktober 2026. Tujuan: menetapkan acuan bentuk sebelum revisi berikutnya.

## Kesimpulan

Preview saat ini terasa seperti ilustrasi perangkat generik. Geometri belum dikalibrasi terhadap model nyata. Masalah terbesarnya adalah ukuran bodi diturunkan dari resolusi ekspor, sementara bezel, radius, kamera dan kaki memakai angka piksel tetap. Akibatnya proporsi detail berubah ketika preview mengecil atau rasio PNG berubah.

Arah revisi: satu model nyata per frame, bodi tetap, seluruh detail diskalakan bersama. Wallpaper ditempatkan di bidang layar yang tetap. Resolusi ekspor hanya mengatur PNG, bukan bentuk perangkat.

## Model acuan dan spesifikasi terverifikasi

Dimensi ponsel/tablet ditulis lebar × tinggi × tebal. Resolusi ponsel/tablet di tabel menggunakan orientasi portrait. Dimensi laptop adalah bodi tertutup, bukan ukuran frontal laptop terbuka.

| Model acuan | Dimensi fisik | Resolusi layar | Ciri visual dan implikasi |
|---|---|---|---|
| iPhone 16 Pro Max | 77.6 × 163 × 8.25 mm | 1320 × 2868 | Dynamic Island terpisah dari bezel atas; sudut halus, garis bingkai tipis. [Apple](https://support.apple.com/en-us/121032) |
| iPhone 13 Pro Max | 78.1 × 160.8 × 7.65 mm | 1284 × 2778 | Model notch harus terpisah dari Dynamic Island; gunakan model/generasi eksplisit. [Apple](https://support.apple.com/en-us/111870) |
| Galaxy S25 Ultra | 77.6 × 162.8 × 8.2 mm | 1440 × 3120 | Layar flat, sudut membulat lebih kecil daripada iPhone, kamera punch-hole. Samsung menyebut bezel depan 1.32 mm. [Samsung Design](https://design.samsung.com/global/contents/galaxy-s25/index.html), [spesifikasi Samsung](https://images.samsung.com/is/content/samsung/assets/global/ir/docs/2025_3Q_Interim_Report.pdf) |
| Sony Xperia 1 V | Referensi dimensinya di spesifikasi resmi | 1644 × 3840 | Panel sangat panjang; keluarga frame terpisah, tidak dipaksakan ke bentuk Galaxy. [Sony](https://www.sony.com/electronics/support/mobile-phones-tablets-mobile-phones/xperia-1-v-256gb/specifications) |
| MacBook Pro 14 inci, M4, 2024 | 312.6 × 221.2 × 15.5 mm, bodi tertutup | 3024 × 1964 | Notch atas, bezel layar, engsel dan base. Sudut pandang depan dan sudut pandang atas perlu komposisi berbeda. [Apple specs](https://support.apple.com/en-us/121552), [panduan bentuk](https://support.apple.com/en-ca/guide/macbook-pro/apd921215d6c/2026/mac/26) |
| MacBook Pro 16 inci, 2024 | Jangan gunakan dimensi model 14 inci | 3456 × 2234 | Model 16 inci mempunyai resolusi sendiri. [Apple](https://support.apple.com/en-au/121554) |
| Apple Studio Display | Panel tanpa stand 623 × 362 mm; tinggi total stand standar 478 mm | 5120 × 2880 | Bezel hampir seragam, bentuk panel tidak sangat membulat; penyangga aluminium lebar dengan dasar mendatar. Bukan kaki oval generik. [Apple specs](https://www.apple.com/studio-display/specs/), [panduan visual](https://support.apple.com/en-euro/guide/studio-display/welcome/mac) |
| Dell UltraSharp U2723QE | Tanpa stand sekitar 24.1 × 13.9 inci, angka resmi dibulatkan | 3840 × 2160 | Pisahkan profil monitor 4K dari Studio Display 5K; pakai kaki sesuai model. [Dell](https://www.dell.com/en-us/shop/dell-ultrasharp-27-4k-usb-c-hub-monitor-u2723qe/apd/210-bdpf/monitors-monitor-accessories) |
| iPad Pro 13 inci, M4 | 215.5 × 281.6 × 5.1 mm | 2064 × 2752 | Bezel seragam; kamera depan pada sisi panjang, jadi berada di samping saat portrait. [Apple](https://support.apple.com/en-ie/119891) |
| Galaxy Tab S10 Ultra | 208.6 × 326.4 × 5.4 mm, portrait | 1848 × 2960 | Tablet lebih panjang daripada iPad; frame dan cutout harus spesifik. [Samsung](https://news.samsung.com/ca/galaxy-tab-s10-series-is-samsungs-ai-ready-tablet) |

Model-model tersebut dipilih sebagai acuan geometri yang bisa diverifikasi, bukan daftar rekomendasi pembelian atau klaim model terbaru.

## Referensi visual yang diperiksa

### Laptop: depan dan area keyboard

Foto depan memperlihatkan layar, notch dan base. Foto atas memperlihatkan engsel, keyboard, speaker dan trackpad. Keyboard tidak terlihat penuh pada pandangan lurus dari depan. Untuk hero yang perlu memperlihatkan keyboard, gunakan sudut sedikit dari atas dan terapkan perspektif yang sama pada seluruh perangkat.

[MacBook tampak depan](https://help.apple.com/assets/68E55784E266DE1F4A0ACA56/68E5578B6ACF768DA9089FBC/en_US/bd699c64b18f97dbe19d361c420a2951.png)

[MacBook keyboard dan trackpad](https://help.apple.com/assets/68E55784E266DE1F4A0ACA56/68E5578B6ACF768DA9089FBC/en_US/2613e6a478f1bc485e77695ed9524c6a.png)

### Ponsel

[Render resmi iPhone 16 Pro Max](https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/121032-iphone-16-pro-max.png)

[Galaxy S25 Ultra depan, referensi bezel dan corner](https://design.samsung.com/global/contents/galaxy-s25/img/samsung-galaxy-s25-popup-2-1.png)

### Monitor dan tablet

[Studio Display depan](https://ipcdn-web.apple.com/assets/v2/web/0b2608f0-b583-40d3-a005-c4b11c55f895)

[iPad Pro 13 M4 diagram depan, kamera pada sisi panjang](https://cdsassets.apple.com/live/7WUAS350/images/tech-specs/ipad-pro-13-inch-m4-portimage-1.png)

Foto dan diagram di atas dilihat langsung di browser. Tidak disalin ke asset produksi.

## Kesalahan pada implementasi sekarang

1. **Bodi bergantung pada PNG.** DeviceFrame menggunakan width/height ekspor sebagai rasio layar dan penentu ukuran shell. Satu model berubah siluet ketika ekspor berubah rasio.
2. **Detail tidak diskalakan bersama.** Radius ponsel 37/29 px, bezel 6/5 px, punch-hole 10 px dan kaki monitor 75/61 px memakai ukuran tetap serta override breakpoint. Tidak ada satu sistem geometri model.
3. **Material terlalu mengilap.** Banyak lapisan gradient dan shadow membuat bingkai tampak seperti plastik/chrome, bukan garis metal tipis dari referensi.
4. **Monitor tercampur.** Frame mempunyai chin tebal dan kaki oval; berbeda dari referensi Studio Display. Resolusi 4K/5K/8K/10K semuanya menggunakan profil Monitor yang sama.
5. **Base laptop tampak seperti baki.** Geometri polygon dan gradient tidak mengikuti sudut pandang lid; base tidak punya geometri engsel/deck yang jelas.
6. **Model ponsel terlalu umum.** Android Rounded/Ultra tidak menyebut generasi acuan. Detail dibedakan terutama lewat radius, belum lewat geometri lengkap.
7. **Kamera iPad salah posisi.** Frame sekarang menaruh kamera di atas saat portrait. Acuan iPad Pro M4 menaruh kamera pada sisi panjang.
8. **Spesifikasi salah dipasangkan.** Referensi MacBook 16 inci memakai resolusi 14 inci. Referensi iPhone 16 Pro Max memakai ukuran 1290 × 2796, bukan 1320 × 2868. Referensi iPad Pro 13 memakai 2048 × 2732, bukan 2064 × 2752 untuk M4.
9. **Ultra 10K bukan 32:9.** Ukuran 10240 × 4320 mempunyai rasio 64:27. Label referensi 32:9 pada preset tersebut tidak cocok; jadikan ukuran canvas khusus atau pilih model ultrawide yang nyata.

## Rencana implementasi berikutnya

### A. Kalibrasi satu frame per model

- Mulai dengan iPhone 16 Pro Max, Galaxy S25 Ultra, MacBook Pro 14, Studio Display dan iPad Pro 13.
- Pakai dimensi fisik untuk rasio bodi ponsel/tablet; pakai tampak depan resmi untuk geometri monitor/laptop terbuka.
- Bedakan angka spesifikasi resmi dengan hasil estimasi dari foto. Radius, cutout dan koordinat screen yang tidak dipublikasikan harus ditandai sebagai kalibrasi visual, bukan ukuran resmi.

### B. Ganti geometri yang tersebar

- Gunakan SVG dengan viewBox tetap per model, atau wrapper koordinat tetap dengan satu skala uniform.
- Definisikan body bounds, screen bounds, corner path, camera bounds, button bounds, base/stand bounds.
- Seluruh detail mengikuti skala model. Breakpoint hanya mengubah ukuran keseluruhan dan layout, bukan mengubah anatomi perangkat.
- Canvas wallpaper tetap tersendiri dan diletakkan di screen bounds. Clip wallpaper mengikuti bentuk layar.

### C. Pisahkan perangkat dari ekspor

- Pilih model untuk menentukan bingkai dan resolusi native awal.
- PNG custom tetap boleh diatur; crop/fit ke layar preview dengan proporsi yang konsisten.
- Jangan meregangkan body atau menampilkan satu monitor biasa sebagai ultrawide hanya karena PNG berubah.
- Landscape tablet memutar seluruh geometri termasuk posisi kamera.

### D. Detail presentasi

- Studio memakai tampak depan agar wallpaper terbaca jelas.
- Hero laptop boleh memakai sudut sedikit dari atas agar deck/keyboard masuk akal.
- Material matte dengan highlight tipis; kurangi efek chrome, bayangan berat dan garis outline berlapis.
- Clock dan UI lockscreen dibuat opsional serta mengikuti model. Hilangkan lingkaran shortcut kosong.

### E. Kriteria review

- Siluet cocok dengan foto resmi saat diletakkan berdampingan.
- Rasio body dan screen tidak berubah saat resolusi PNG diubah.
- Bezel, corner, camera, base dan stand tetap proporsional pada preview kecil maupun besar.
- iPhone notch tidak dipakai untuk model Dynamic Island; iPad camera mengikuti sisi panjang.
- Frame tetap tidak ikut masuk ke file wallpaper yang diunduh.

## Status

Riset dan audit geometri selesai. Dokumen ini menjadi acuan revisi berikutnya; bentuk preview aplikasi belum diganti lagi pada tahap riset ini.


## Implementasi revisi

Frame sekarang menggunakan koordinat SVG tetap untuk setiap profil, terpisah dari dimensi PNG. Detail kamera, bezel, tombol, keyboard, trackpad dan kaki ikut diskalakan bersama. Preset native telah diperbarui untuk iPhone 16/13 Pro Max, Galaxy S25/Ultra, iPad Pro M4 dan Tab S10 Ultra. Monitor Dell dan Studio Display mempunyai profil terpisah. Tablet mendukung portrait/landscape, termasuk posisi kamera dan dimensi PNG. Jam bisa disembunyikan.

Bentuk ini merupakan ilustrasi vektor berdasarkan referensi, bukan render CAD atau reproduksi foto produk. Keyboard laptop disederhanakan untuk preview dengan sudut sedikit dari atas. Resolusi tambahan pada monitor adalah pilihan ekspor wallpaper, bukan klaim resolusi native panel.
