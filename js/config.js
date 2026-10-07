/* =========================================================
   AYARLAR — siteyi kişiselleştirmek için sadece burayı düzenle
   ========================================================= */
window.CONFIG = {
  owner: 'Eyüp',              // BMO sana bu isimle hitap eder
  possessive: "Eyüp'ün",      // "…'ün projeleri" gibi cümlelerde kullanılır
  title: "EYÜP'ÜN AĞAÇ EVİ",
  username: 'Eyupbayuk31',    // GitHub kullanıcı adı (repolar buradan çekilir)
  maxCarts: 10,               // sahnede en fazla kaç kaset olsun
  hide: ['Porto'],            // gösterilmeyecek repolar
  pin: [],                    // önce gösterilecek repolar, ör: ['mesai', 'Oyun']

  // Repo bazlı ince ayar: kendi kapak görselin, demo linki, açıklama...
  // Kapak görseli verilmezse BMO her proje için piksel-art kapak çizer.
  overrides: {
    // mesai: { cover: 'img/mesai.png', demo: 'https://...', desc: 'Mesai takip uygulaması' },
  },

  // GitHub API'ye ulaşılamazsa gösterilecek kasetler
  fallback: [
    { name: 'mesai', lang: 'JavaScript', desc: 'Mesai ve çalışma saatleri takibi.' },
    { name: 'Oyun', lang: 'TypeScript', desc: 'Tarayıcıda çalışan bir oyun.' },
    { name: 'eyup', lang: 'HTML', desc: 'Üretim ve sevkiyat takip uygulaması.' },
    { name: 'bakim', lang: 'C#', desc: 'Bakım takip aracı.' },
    { name: 'DefenderControl', lang: 'C#', desc: 'Windows Defender kontrol aracı.' },
    { name: 'goodbyedpi', lang: 'Go', desc: 'DPI atlatma aracı.' },
  ],
};
