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
    // Gerçek ek istatistiklerin varsa (indirme, kullanıcı vb.) proje sayfasında gösterilir:
    // mesai: { stats: [['Kullanıcı', '120'], ['İndirme', '450']] },
  },

  // Altın "Hakkımda" kaseti. Boş bırakılan alanlar GitHub profilinden doldurulur.
  about: {
    enabled: true,
    name: '',                 // boşsa GitHub'daki isim
    bio: '',                  // boşsa GitHub bio'su
    text: '',                 // uzun tanıtım yazısı (boşsa profil README'si ya da otomatik metin)
    skills: [],               // ek yetenekler, ör: ['PWA', 'Arduino'] (diller projelerden otomatik gelir)
    links: [
      // { label: 'Instagram', url: 'https://instagram.com/...' },
      // { label: 'LinkedIn', url: 'https://linkedin.com/in/...' },
      // { label: 'E-posta', url: 'mailto:...' },
    ],
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
