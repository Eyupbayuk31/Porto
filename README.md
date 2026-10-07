# Eyüp'ün Ağaç Evi 🎮

GitHub projelerimin BMO temalı, animasyonlu portfolyo sitesi. Her repo bir **kaset**: seç, BMO'ya tak, ekranına dal.

## Özellikler
- Tamamen kodla çizilmiş ağaç evi sahnesi (SVG): perspektifli zemin, pencereden düşen ışık ve toz zerrecikleri, yanıp sönen ampuller, paralaks
- Repolar GitHub API'den otomatik çekilir, her biri için piksel-art kapak üretilir
- Kaset uçarak BMO'ya gider, yuvaya kayarak girer, BMO açılış ekranı gösterir
- BMO'nun gözleri seçili kaseti / fareyi takip eder, konuşurken ağzı oynar, el sallar
- Ekrana "dalış" geçişi → proje sayfası (açıklama, istatistikler, README, linkler)
- Tüm sesler WebAudio ile sentezlenir (konuşma sesi, kaset sesi, açılış melodisi, isteğe bağlı chiptune müzik)
- **Sürükle-bırak:** kaseti tutup BMO'ya götür, BMO sevinip yuvasını parlatır
- **Gece/gündüz:** ziyaretçinin saatine göre; pencereye tıkla ya da `N` ile değiştir (ay, yıldızlar, ateş böcekleri)
- **Altın "Hakkımda" kaseti:** GitHub profili, kullanılan diller ve linkler
- **Etkileşimli oda:** kitaplık, kılıç, saksı, tablo ve pufa tıkla, BMO yorum yapsın
- **Paylaşılabilir link:** `…/Porto/#mesai` o kaseti takılı açar; proje sayfasında "Linki kopyala" butonu
- Klavye: `← ↑ ↓ →` seç · `Enter` tak · `A` içine gir · `B` çıkar · `Esc` geri · `M` müzik
- Mobil uyumlu, `prefers-reduced-motion` destekli, bağımlılık yok

## Kişiselleştirme
Her şey `js/config.js` içinde: kullanıcı adı, gizlenecek/öne çıkacak repolar, repo bazlı kapak görseli, demo linki ve gerçek ek istatistikler, "Hakkımda" metni ve sosyal medya linkleri.

## Yayınlama
Statik site — derleme yok. GitHub Pages (Settings → Pages → `main` / root) ya da Vercel/Netlify'a olduğu gibi yüklenebilir.
