# Eyüp'ün Ağaç Evi 🎮

GitHub projelerimin BMO temalı, animasyonlu portfolyo sitesi. Her repo bir **kaset**: seç, BMO'ya tak, ekranına dal.

## Özellikler
- Tamamen kodla çizilmiş ağaç evi sahnesi (SVG): perspektifli zemin, pencereden düşen ışık ve toz zerrecikleri, yanıp sönen ampuller, paralaks
- Repolar GitHub API'den otomatik çekilir, her biri için piksel-art kapak üretilir
- Kaset uçarak BMO'ya gider, yuvaya kayarak girer, BMO açılış ekranı gösterir
- BMO'nun gözleri seçili kaseti / fareyi takip eder, konuşurken ağzı oynar, el sallar
- Ekrana "dalış" geçişi → proje sayfası (açıklama, istatistikler, README, linkler)
- Tüm sesler WebAudio ile sentezlenir (konuşma sesi, kaset sesi, açılış melodisi, isteğe bağlı chiptune müzik)
- Klavye: `← ↑ ↓ →` seç · `Enter` tak · `A` içine gir · `B` çıkar · `Esc` geri · `M` müzik
- Mobil uyumlu, `prefers-reduced-motion` destekli, bağımlılık yok

## Kişiselleştirme
Her şey `js/config.js` içinde: kullanıcı adı, gizlenecek/öne çıkacak repolar, repo bazlı kapak görseli ve demo linki.

## Yayınlama
Statik site — derleme yok. GitHub Pages (Settings → Pages → `main` / root) ya da Vercel/Netlify'a olduğu gibi yüklenebilir.
