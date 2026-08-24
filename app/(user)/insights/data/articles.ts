// PERINGATAN: SELURUH ISI SEMBILAN ARTIKEL DI FILE INI FIKTIF.
//
// Judul, ringkasan, dan seluruh isi `body` di bawah adalah karangan yang dibuat
// sebagai bahan uji tampilan. Nama penulis dan penelaahnya mengacu ke profil
// profesional yang juga karangan — lihat
// `app/(user)/professionals/data/professionals.ts`.
//
// Ini teks kesehatan mental yang tampil seolah sudah ditelaah tenaga medis, jenis
// konten yang paling mudah dipercaya orang yang sedang mencari pertolongan. Karena
// itu isi di bawah ditulis dengan tiga pantangan yang HARUS dipertahankan selama
// datanya masih karangan: tidak ada angka statistik, tidak ada rujukan penelitian,
// dan tidak ada nama obat maupun dosis. Ketiganya akan jadi fakta palsu yang tidak
// bisa dilacak sumbernya.
//
// SELURUH ISI FILE INI HARUS DIGANTI TULISAN ASLI YANG DITELAAH PROFESIONAL
// SUNGGUHAN SEBELUM HALAMAN INI PERNAH TAYANG KE PUBLIK. Lihat `prd.md` bagian 11.
//
// Field `body` ditambahkan 21 Agustus 2026 memakai blok terstruktur
// (`ArticleBlock`), bukan HTML atau Markdown. Alasannya ada di `design.md` bagian
// 17. `readTimeMinutes` kini nilai turunan, bukan angka pilihan: rumusnya
// `ceil(jumlah kata / 180)`, dihitung dari `text` milik heading/paragraph/quote
// plus seluruh `items` milik list, dan TIDAK menghitung `attribution`. Dijaga
// `scripts/check-data-invariants.mjs`, jadi jangan diubah manual — ubah `body`-nya
// dan biarkan angkanya menyesuaikan. Sembilan angka lama (4–9 menit) ditulis
// tangan waktu `body` belum ada dan semuanya keliru; sekarang 2–4 menit karena
// badan artikel contoh ini memang lebih pendek daripada artikel sungguhan.

import type {
  Article,
  ArticlePerson,
  ArticleTopic,
} from "../type/article";
const topics = {
  kecemasan: { id: "topic-1", slug: "kecemasan", name: "Kecemasan" },
  stres: { id: "topic-2", slug: "stres", name: "Stres" },
  burnout: { id: "topic-3", slug: "burnout", name: "Burnout" },
  trauma: { id: "topic-4", slug: "trauma", name: "Trauma" },
  hubungan: { id: "topic-5", slug: "hubungan", name: "Hubungan" },
  pengembanganDiri: {
    id: "topic-6",
    slug: "pengembangan-diri",
    name: "Pengembangan Diri",
  },
  polaTidur: { id: "topic-7", slug: "pola-tidur", name: "Pola Tidur" },
  pengasuhan: { id: "topic-8", slug: "pengasuhan", name: "Pengasuhan" },
  dukaCita: { id: "topic-9", slug: "duka-cita", name: "Duka Cita" },
} satisfies Record<string, ArticleTopic>;
const people = {
  anindita: {
    id: "person-1",
    professionalSlug: "anindita-rahmawati",
    name: "Anindita Rahmawati",
    credentials: "M.Psi., Psikolog",
    avatarUrl: null,
  },
  bagas: {
    id: "person-2",
    professionalSlug: "bagas-priyatna",
    name: "Bagas Priyatna",
    credentials: "dr., Sp.KJ",
    avatarUrl: null,
  },
  chandra: {
    id: "person-3",
    professionalSlug: "chandra-wijaya",
    name: "Chandra Wijaya",
    credentials: "M.Psi., Psikolog",
    avatarUrl: null,
  },
  dian: {
    id: "person-4",
    professionalSlug: "dian-puspitasari",
    name: "Dian Puspitasari",
    credentials: "S.Psi., Konselor",
    avatarUrl: null,
  },
  eka: {
    id: "person-5",
    professionalSlug: "eka-nurhaliza",
    name: "Eka Nurhaliza",
    credentials: "M.Psi., Psikolog",
    avatarUrl: null,
  },
  fajar: {
    id: "person-6",
    professionalSlug: "fajar-ramadhan",
    name: "Fajar Ramadhan",
    credentials: "dr., Sp.KJ",
    avatarUrl: null,
  },
  gita: {
    id: "person-7",
    professionalSlug: "gita-maheswari",
    name: "Gita Maheswari",
    credentials: "M.Psi., Psikolog",
    avatarUrl: null,
  },
  hendra: {
    id: "person-8",
    professionalSlug: "hendra-saputra",
    name: "Hendra Saputra",
    credentials: "S.Psi., Konselor",
    avatarUrl: null,
  },
  intan: {
    id: "person-9",
    professionalSlug: "intan-larasati",
    name: "Intan Larasati",
    credentials: "M.Psi., Psikolog",
    avatarUrl: null,
  },
} satisfies Record<string, ArticlePerson>;

const articles: Article[] = [
  {
    id: "art-1",
    slug: "mengenali-tanda-awal-kecemasan",
    title: "Mengenali Tanda Awal Kecemasan yang Sering Diabaikan",
    excerpt:
      "Kecemasan tidak selalu terasa seperti panik. Sering kali bentuknya justru dada yang sesak, sulit tidur, atau tubuh yang selalu waspada.",
    coverImageUrl: null,
    topic: topics.kecemasan,
    author: people.anindita,
    reviewer: people.bagas,
    reviewedAt: "2026-07-28T00:00:00.000Z",
    publishedAt: "2026-07-30T02:00:00.000Z",
    readTimeMinutes: 4,
    body: [
      {
        kind: "paragraph",
        id: "art-1-b1",
        text: "Banyak orang datang ke sesi pertama tanpa sekali pun menyebut kata cemas. Yang mereka keluhkan justru hal-hal yang terasa jelas di badan: dada yang sesak, rahang yang pegal setiap pagi, atau tidur yang tidak pernah benar-benar dalam. Baru setelah ditelusuri beberapa minggu ke belakang, terlihat bahwa keluhan itu muncul bersamaan dengan satu periode yang menuntut kewaspadaan terus-menerus.",
      },
      {
        kind: "heading",
        id: "art-1-b2",
        text: "Cemas lebih sering terasa di badan daripada di kepala",
      },
      {
        kind: "paragraph",
        id: "art-1-b3",
        text: "Gambaran kecemasan yang paling sering dipakai orang adalah serangan panik: napas yang mengejar, tangan dingin, dan rasa bahwa sesuatu yang buruk sedang menunggu. Bentuk itu memang ada, tetapi dia bukan yang paling umum. Yang jauh lebih sering terjadi adalah versi yang tampak tenang di permukaan, yaitu tubuh yang tidak pernah turun dari posisi siaga walau tidak ada apa pun yang sedang mengancam.",
      },
      {
        kind: "paragraph",
        id: "art-1-b4",
        text: "Dalam kondisi itu tubuh bekerja seperti mesin yang dibiarkan menyala sepanjang hari. Tidak ada satu kejadian besar yang bisa ditunjuk sebagai penyebab, tetapi bahan bakarnya tetap habis. Karena tidak ada momen dramatis untuk dijadikan penanda, orang cenderung menyimpulkan bahwa dirinya sekadar kurang tidur, kurang olahraga, atau kurang kuat menahan beban.",
      },
      {
        kind: "heading",
        id: "art-1-b5",
        text: "Tanda yang biasanya lolos dari perhatian",
      },
      {
        kind: "paragraph",
        id: "art-1-b6",
        text: "Daftar berikut bukan alat untuk mendiagnosis diri sendiri. Gunanya lebih sederhana: kalau beberapa di antaranya terasa akrab dan sudah berjalan lebih dari beberapa minggu, itu sudah cukup menjadi alasan untuk membicarakannya dengan orang yang terlatih.",
      },
      {
        kind: "list",
        id: "art-1-b7",
        ordered: false,
        items: [
          "Sulit memulai pekerjaan yang sebenarnya dikuasai, karena kepala lebih dulu penuh membayangkan cara pekerjaan itu bisa gagal.",
          "Tidur datang cepat karena kelelahan, tetapi mata terbuka pada jam yang sama setiap dini hari dengan pikiran yang sudah menyala.",
          "Bahu, leher, atau rahang yang pegal terus-menerus tanpa penjelasan dari aktivitas fisik.",
          "Kebiasaan memeriksa ulang hal yang sudah dipastikan: pintu yang sudah dikunci, pesan yang sudah terkirim, angka yang sudah dihitung.",
          "Rasa lega yang hanya bertahan sebentar setelah satu urusan selesai, karena perhatian langsung berpindah ke urusan berikutnya.",
          "Menghindari hal kecil yang dulu biasa dilakukan, misalnya menelepon, lalu menggantinya dengan cara yang terasa lebih aman.",
        ],
      },
      {
        kind: "quote",
        id: "art-1-b8",
        text: "Yang paling sering saya dengar bukan “saya cemas”, tetapi “saya capek terus padahal tidak melakukan apa-apa”. Dua kalimat itu sering menggambarkan hal yang sama.",
        attribution: "Anindita Rahmawati, M.Psi., Psikolog",
      },
      {
        kind: "heading",
        id: "art-1-b9",
        text: "Kenapa tanda awal layak diperhatikan",
      },
      {
        kind: "paragraph",
        id: "art-1-b10",
        text: "Kecemasan cenderung menyusutkan ruang gerak seseorang secara perlahan. Satu hal dihindari karena terasa berat, lalu hal itu makin terasa berat justru karena dihindari. Pola ini berjalan tanpa suara sampai daftar hal yang bisa dilakukan dengan tenang tinggal sedikit, dan pada titik itu yang tersisa sering sudah bukan kecemasan saja, melainkan juga rasa kecil terhadap diri sendiri.",
      },
      {
        kind: "paragraph",
        id: "art-1-b11",
        text: "Menangkapnya lebih awal berarti pekerjaan yang perlu dilakukan masih relatif ringan. Bukan karena kecemasannya lebih sepele, tetapi karena kebiasaan menghindar belum mengeras dan hidup sehari-hari belum menyesuaikan diri terhadapnya.",
      },
      {
        kind: "heading",
        id: "art-1-b12",
        text: "Yang bisa dikerjakan sambil menimbang bantuan profesional",
      },
      {
        kind: "list",
        id: "art-1-b13",
        ordered: true,
        items: [
          "Catat waktunya, bukan hanya rasanya. Jam berapa keluhan itu paling kuat dan sedang mengerjakan apa. Pola waktu jauh lebih mudah dibaca orang lain daripada kalimat “saya tidak enak badan terus”.",
          "Pisahkan yang bisa diputuskan hari ini dari yang belum bisa. Sebagian besar beban di kepala biasanya masuk kelompok kedua, dan menyadarinya tidak menyelesaikan masalah tetapi mengurangi jumlah hal yang dipikirkan sekaligus.",
          "Kembalikan satu hal yang sudah dihindari, dalam ukuran paling kecil yang masih mungkin. Bukan untuk membuktikan diri kuat, melainkan supaya tubuh mendapat bukti bahwa hal itu tidak seburuk dugaannya.",
          "Perlakukan tidur sebagai jadwal, bukan sebagai hasil. Jam bangun yang tetap biasanya lebih menolong daripada usaha memaksakan diri lekas terlelap.",
        ],
      },
      {
        kind: "paragraph",
        id: "art-1-b14",
        text: "Kalau keluhannya sudah mengubah cara kamu bekerja, tidur, atau berhubungan dengan orang terdekat, langkah yang paling masuk akal adalah membicarakannya dengan psikolog atau psikiater. Tulisan ini hanya bahan untuk mengenali, bukan pengganti pemeriksaan, dan tidak ada bagian dari daftar di atas yang bisa memastikan apa yang sedang terjadi pada satu orang tertentu.",
      },
    ],
    createdAt: "2026-07-24T02:00:00.000Z",
  },
  {
    id: "art-2",
    slug: "burnout-bukan-sekadar-capek",
    title: "Kelelahan Kerja Bukan Sekadar Capek: Memahami Burnout",
    excerpt:
      "Istirahat panjang kadang tidak menolong karena yang habis bukan tenaga, melainkan makna. Ini bedanya lelah biasa dan burnout.",
    coverImageUrl: null,
    topic: topics.burnout,
    author: people.chandra,
    reviewer: people.anindita,
    reviewedAt: "2026-07-18T00:00:00.000Z",
    publishedAt: "2026-07-21T02:00:00.000Z",
    readTimeMinutes: 4,
    body: [
      {
        kind: "paragraph",
        id: "art-2-b1",
        text: "Ada satu keluhan yang hampir selalu muncul dengan nada bingung: sudah cuti seminggu, sudah tidur cukup, tetapi kembali bekerja pada hari pertama rasanya sama beratnya seperti sebelum cuti. Kalau istirahat tidak mengubah apa pun, kemungkinan besar yang sedang habis bukan tenaga.",
      },
      {
        kind: "heading",
        id: "art-2-b2",
        text: "Capek biasa pulih dengan istirahat, burnout tidak",
      },
      {
        kind: "paragraph",
        id: "art-2-b3",
        text: "Lelah biasa punya bentuk yang rapi. Ada sebabnya, ada puncaknya, dan ada titik ketika tubuh kembali normal setelah dipulihkan. Burnout tidak mengikuti pola itu. Dia tumbuh dari beban yang berjalan terus tanpa jeda yang berarti, dan yang terkikis bukan hanya tenaga fisik, melainkan juga hubungan seseorang dengan pekerjaannya sendiri.",
      },
      {
        kind: "paragraph",
        id: "art-2-b4",
        text: "Karena itu tidur delapan jam tidak menyentuh persoalannya. Orang yang lelah butuh berhenti sebentar; orang yang mengalami burnout butuh sesuatu berubah. Kedua kebutuhan itu terlihat mirip dari luar, tetapi jawaban untuk yang pertama justru bisa membuat yang kedua terasa lebih menyakitkan, sebab istirahat yang gagal menolong mudah dibaca sebagai bukti bahwa masalahnya ada pada diri sendiri.",
      },
      {
        kind: "heading",
        id: "art-2-b5",
        text: "Tiga hal yang biasanya muncul bersamaan",
      },
      {
        kind: "paragraph",
        id: "art-2-b6",
        text: "Burnout jarang datang sebagai satu gejala tunggal. Yang biasanya terlihat adalah tiga hal yang saling menyeret, dan ketiganya perlu dibaca bersama-sama.",
      },
      {
        kind: "list",
        id: "art-2-b7",
        ordered: false,
        items: [
          "Tenaga yang tidak pernah penuh. Pagi terasa seperti sudah setengah hari, dan pekerjaan yang dulu ringan kini butuh persiapan mental lebih dulu.",
          "Jarak emosional dari pekerjaan. Hal yang dulu terasa penting jadi terasa datar. Sikap sinis muncul bukan karena orangnya berubah, melainkan karena menjaga jarak lebih murah daripada terus peduli.",
          "Rasa tidak efektif. Hasil kerja dinilai sendiri sebagai kurang, sekalipun orang lain menilai sebaliknya, dan penilaian itu perlahan meluas dari pekerjaan ke diri secara keseluruhan.",
        ],
      },
      {
        kind: "quote",
        id: "art-2-b8",
        text: "Orang yang datang dengan burnout hampir selalu masih peduli pada pekerjaannya. Kalau sudah benar-benar tidak peduli, biasanya mereka tidak repot-repot mencari bantuan.",
        attribution: "Chandra Wijaya, M.Psi., Psikolog",
      },
      {
        kind: "heading",
        id: "art-2-b9",
        text: "Kenapa liburan sering tidak menolong",
      },
      {
        kind: "paragraph",
        id: "art-2-b10",
        text: "Liburan memindahkan orangnya, bukan keadaannya. Beban kerja yang sama, tuntutan yang sama, dan kendali yang sama tipis tetap menunggu di tempat yang sama. Yang berubah hanya jeda, dan jeda tanpa perubahan biasanya hanya menunda titik jenuh berikutnya.",
      },
      {
        kind: "paragraph",
        id: "art-2-b11",
        text: "Ada satu hal yang membuat keadaan lebih rumit: menjelang cuti, banyak orang justru bekerja lebih keras untuk mengosongkan meja, lalu sepulang cuti menemukan tumpukan yang menunggu. Dua puncak beban mengapit satu periode istirahat, dan hasil akhirnya bisa terasa lebih melelahkan daripada tidak pergi sama sekali.",
      },
      {
        kind: "heading",
        id: "art-2-b12",
        text: "Bedanya dengan sekadar tidak menyukai pekerjaan",
      },
      {
        kind: "paragraph",
        id: "art-2-b13",
        text: "Tidak semua rasa berat terhadap pekerjaan adalah burnout. Ada orang yang memang berada di peran yang tidak cocok, dan bagi mereka jawabannya lebih dekat ke keputusan karier daripada ke penanganan kesehatan mental. Petunjuk yang biasanya membedakan keduanya adalah arah perubahannya: pada burnout, kondisinya menurun dari titik ketika pekerjaan itu masih terasa berarti, dan penurunan itu ikut terbawa ke bagian hidup yang lain.",
      },
      {
        kind: "paragraph",
        id: "art-2-b14",
        text: "Petunjuk lain adalah luasnya dampak. Rasa tidak suka pada pekerjaan umumnya berhenti di gerbang kantor. Burnout ikut pulang, muncul di akhir pekan, dan menipiskan kesabaran terhadap orang-orang yang tidak ada hubungannya dengan pekerjaan.",
      },
      {
        kind: "heading",
        id: "art-2-b15",
        text: "Langkah yang realistis untuk dicoba",
      },
      {
        kind: "list",
        id: "art-2-b16",
        ordered: true,
        items: [
          "Ganti pertanyaan dari “kapan saya bisa istirahat” menjadi “apa yang harus berubah”. Pertanyaan pertama menghasilkan jadwal, pertanyaan kedua menghasilkan pilihan.",
          "Cari satu bagian pekerjaan yang masih bisa kamu kendalikan sendiri, sekecil apa pun. Rasa punya kendali biasanya lebih menentukan daripada jumlah jam kerja.",
          "Beri tahu satu orang di lingkungan kerja, dengan kalimat yang menggambarkan beban, bukan menilai diri. Burnout yang disimpan sendiri hampir selalu berumur lebih panjang.",
          "Hentikan kebiasaan mengejar ketertinggalan pada akhir pekan. Utang kerja yang dibayar dengan hari libur akan menagih lagi dengan bunga.",
          "Kalau kondisinya sudah berjalan berbulan-bulan, bawa ke profesional. Burnout yang dibiarkan lama sering berjalan bersama keluhan lain yang perlu diperiksa terpisah.",
        ],
      },
      {
        kind: "paragraph",
        id: "art-2-b17",
        text: "Satu hal terakhir yang perlu dikatakan terang-terangan: burnout bukan bukti kurangnya daya tahan. Dia lebih sering muncul pada orang yang bertahan terlalu lama di keadaan yang seharusnya berubah lebih dulu. Kalau kamu mengenali dirimu di tulisan ini, membicarakannya dengan psikolog atau psikiater adalah langkah yang wajar, bukan langkah berlebihan.",
      },
    ],
    createdAt: "2026-07-15T02:00:00.000Z",
  },
  {
    id: "art-3",
    slug: "tidur-yang-terus-terganggu",
    title: "Tidur yang Terus Terganggu dan Apa yang Bisa Dilakukan",
    excerpt:
      "Sulit tidur yang berlangsung berminggu-minggu jarang berdiri sendiri. Biasanya ada hal lain yang sedang menuntut perhatian.",
    coverImageUrl: null,
    topic: topics.polaTidur,
    author: people.bagas,
    reviewer: people.fajar,
    reviewedAt: "2026-07-09T00:00:00.000Z",
    publishedAt: "2026-07-12T02:00:00.000Z",
    readTimeMinutes: 3,
    body: [
      {
        kind: "paragraph",
        id: "art-3-b1",
        text: "Satu atau dua malam yang buruk adalah hal biasa dan hampir semua orang mengalaminya. Yang perlu diperhatikan adalah pola yang bertahan: kesulitan tidur yang muncul lebih dari beberapa malam dalam seminggu, berjalan selama berminggu-minggu, dan mulai terasa akibatnya pada siang hari.",
      },
      {
        kind: "heading",
        id: "art-3-b2",
        text: "Gangguan tidur jarang berdiri sendiri",
      },
      {
        kind: "paragraph",
        id: "art-3-b3",
        text: "Tidur adalah salah satu hal pertama yang terpengaruh ketika ada sesuatu yang tidak beres, dan karena itu ia sering menjadi tanda paling awal, bukan masalah utamanya. Kecemasan, tekanan pekerjaan, duka, nyeri fisik yang belum tertangani, dan beberapa kondisi medis semuanya bisa muncul lebih dulu sebagai keluhan tidur.",
      },
      {
        kind: "paragraph",
        id: "art-3-b4",
        text: "Itulah sebabnya menangani tidur tanpa menengok apa yang ada di belakangnya sering hanya memberi perbaikan sementara. Bentuk keluhannya juga bisa memberi petunjuk arah: sulit memulai tidur cenderung berjalan bersama pikiran yang belum berhenti, sedangkan bangun dini hari dan tidak bisa kembali tidur adalah pola yang perlu diperiksa lebih teliti oleh tenaga kesehatan.",
      },
      {
        kind: "heading",
        id: "art-3-b5",
        text: "Kebiasaan yang tanpa sadar memperpanjang masalah",
      },
      {
        kind: "list",
        id: "art-3-b6",
        ordered: false,
        items: [
          "Menghabiskan waktu lama di tempat tidur dalam keadaan terjaga, sehingga kasur perlahan diasosiasikan dengan usaha, bukan dengan istirahat.",
          "Membalas kurang tidur dengan tidur siang panjang atau bangun jauh lebih lambat pada akhir pekan, yang membuat jam tubuh bergeser setiap beberapa hari.",
          "Menghitung sisa jam tidur berulang kali di tengah malam. Kebiasaan ini menambah kewaspadaan tepat pada saat tubuh perlu menurunkannya.",
          "Menjadikan alkohol sebagai cara membuat diri lekas terlelap. Tidur mungkin datang lebih cepat, tetapi kualitas paruh kedua malam biasanya menurun.",
          "Memakai layar sampai menit terakhir sambil mengerjakan hal yang menuntut keputusan, misalnya membalas pesan pekerjaan.",
        ],
      },
      {
        kind: "quote",
        id: "art-3-b7",
        text: "Kalau pasien bertanya apa satu hal yang paling menolong, jawaban saya hampir selalu sama: jam bangun yang tetap. Bukan jam tidurnya, jam bangunnya.",
        attribution: "Bagas Priyatna, dr., Sp.KJ",
      },
      {
        kind: "heading",
        id: "art-3-b8",
        text: "Yang bisa dicoba lebih dulu",
      },
      {
        kind: "list",
        id: "art-3-b9",
        ordered: true,
        items: [
          "Tetapkan jam bangun yang sama setiap hari, termasuk akhir pekan, dan pertahankan selama dua minggu sebelum menilai hasilnya.",
          "Kalau sudah cukup lama berbaring tanpa mengantuk, keluar dari kamar dan lakukan sesuatu yang tenang sampai kantuk datang, lalu kembali.",
          "Pindahkan urusan yang menuntut keputusan ke waktu yang lebih awal, dan sisakan satu jam terakhir untuk kegiatan yang tidak menghasilkan daftar tugas baru.",
          "Catat pola tidurmu selama dua minggu secara sederhana. Catatan ini biasanya jauh lebih berguna bagi dokter daripada ingatan tentang malam-malam yang buruk.",
        ],
      },
      {
        kind: "heading",
        id: "art-3-b10",
        text: "Kapan sebaiknya diperiksa",
      },
      {
        kind: "paragraph",
        id: "art-3-b11",
        text: "Ada beberapa keadaan yang sebaiknya tidak ditunggu terlalu lama: keluhan yang berjalan lebih dari sebulan meskipun kebiasaan tidur sudah dirapikan, rasa mengantuk berat pada siang hari yang mengganggu pekerjaan atau membuat berkendara tidak aman, dengkuran keras yang disertai napas berhenti sesaat menurut keterangan orang lain, serta kesulitan tidur yang datang bersama perubahan suasana hati yang menetap.",
      },
      {
        kind: "paragraph",
        id: "art-3-b12",
        text: "Tulisan ini tidak membahas obat, dan itu disengaja. Keputusan mengenai obat tidur perlu diambil oleh dokter yang memeriksa langsung, karena pilihannya bergantung pada penyebab, riwayat kesehatan, dan hal lain yang tidak bisa dinilai dari sebuah artikel. Kalau tidurmu sudah terganggu cukup lama, bawa catatanmu ke dokter atau psikiater dan mulailah dari sana.",
      },
    ],
    createdAt: "2026-07-06T02:00:00.000Z",
  },
  {
    id: "art-4",
    slug: "menemani-orang-terdekat-yang-berduka",
    title: "Menemani Orang Terdekat yang Sedang Berduka",
    excerpt:
      "Tidak ada kalimat ajaib yang menyembuhkan duka. Yang biasanya paling menolong justru kehadiran yang tidak menuntut apa-apa.",
    coverImageUrl: null,
    topic: topics.dukaCita,
    author: people.dian,
    reviewer: people.gita,
    reviewedAt: "2026-06-30T00:00:00.000Z",
    publishedAt: "2026-07-03T02:00:00.000Z",
    readTimeMinutes: 2,
    body: [
      {
        kind: "paragraph",
        id: "art-4-b1",
        text: "Orang yang ingin menemani seseorang yang berduka hampir selalu bertanya hal yang sama: harus bilang apa. Pertanyaan itu wajar, tetapi biasanya salah sasaran. Yang paling diingat orang yang berduka umumnya bukan kalimat yang diucapkan, melainkan siapa yang muncul dan siapa yang menghilang.",
      },
      {
        kind: "heading",
        id: "art-4-b2",
        text: "Kalimat yang niatnya baik tetapi sering terasa menutup",
      },
      {
        kind: "paragraph",
        id: "art-4-b3",
        text: "Sebagian kalimat penghiburan sebenarnya berfungsi menenangkan si pengucap, bukan yang mendengar. Ciri umumnya adalah kalimat itu buru-buru mencari sisi baik atau menutup pembicaraan dengan penjelasan.",
      },
      {
        kind: "list",
        id: "art-4-b4",
        ordered: false,
        items: [
          "Kalimat yang membandingkan kehilangan dengan kehilangan orang lain, karena membuat dukanya terasa harus diukur dulu sebelum boleh dirasakan.",
          "Kalimat yang menyodorkan hikmah terlalu dini, sementara yang bersangkutan bahkan belum selesai menerima kenyataannya.",
          "Kalimat yang menyuruh kuat atau mengingatkan ada orang lain yang perlu dijaga, yang terdengar seperti larangan untuk sedih.",
          "Tawaran umum semacam “kabari kalau butuh apa-apa”, yang memindahkan beban meminta tolong kepada orang yang sedang paling tidak sanggup memintanya.",
        ],
      },
      {
        kind: "quote",
        id: "art-4-b5",
        text: "Kehadiran yang tidak menuntut apa-apa hampir selalu lebih menolong daripada kalimat yang paling tepat sekalipun.",
        attribution: "Dian Puspitasari, S.Psi., Konselor",
      },
      {
        kind: "heading",
        id: "art-4-b6",
        text: "Yang biasanya benar-benar menolong",
      },
      {
        kind: "list",
        id: "art-4-b7",
        ordered: true,
        items: [
          "Tawarkan bantuan yang konkret dan sudah kamu putuskan sendiri, misalnya mengantar anaknya sekolah hari Rabu, bukan menawarkan bantuan secara umum.",
          "Sebut nama orang yang meninggal. Banyak orang berduka justru kesepian karena semua orang di sekitarnya menghindari nama itu.",
          "Bersedia mendengar cerita yang sama berulang kali. Pengulangan adalah bagian dari cara orang mencerna kehilangan, bukan tanda dia tidak maju.",
          "Ingat tanggal-tanggal sulitnya dan muncul pada saat itu. Perhatian bulan keenam biasanya lebih berkesan daripada perhatian minggu pertama.",
        ],
      },
      {
        kind: "paragraph",
        id: "art-4-b8",
        text: "Duka tidak punya jadwal yang seragam, dan naik turunnya adalah hal yang wajar. Tetapi kalau setelah waktu yang panjang orang yang kamu temani masih tidak bisa menjalani hari-harinya, menarik diri sepenuhnya, atau kamu mendengar hal yang membuatmu khawatir akan keselamatannya, dorong dia menemui profesional dan tawarkan untuk menemani pada pertemuan pertama.",
      },
    ],
    createdAt: "2026-06-27T02:00:00.000Z",
  },
  {
    id: "art-5",
    slug: "batas-sehat-kerja-dan-kehidupan-pribadi",
    title: "Batas Sehat antara Pekerjaan dan Kehidupan Pribadi",
    excerpt:
      "Menetapkan batas bukan soal menolak pekerjaan, tapi soal memutuskan lebih awal apa yang mau dilindungi.",
    coverImageUrl: null,
    topic: topics.stres,
    author: people.eka,
    reviewer: null,
    reviewedAt: null,
    publishedAt: "2026-06-24T02:00:00.000Z",
    readTimeMinutes: 2,
    body: [
      {
        kind: "paragraph",
        id: "art-5-b1",
        text: "Batas sering dibayangkan sebagai penolakan: mengatakan tidak, menutup laptop, mematikan notifikasi. Padahal bagian yang paling menentukan terjadi jauh sebelum itu, yaitu ketika seseorang memutuskan hal apa dalam hidupnya yang tidak boleh diambil oleh pekerjaan.",
      },
      {
        kind: "heading",
        id: "art-5-b2",
        text: "Batas yang tidak diputuskan akan diputuskan orang lain",
      },
      {
        kind: "paragraph",
        id: "art-5-b3",
        text: "Kalau tidak ada yang ditetapkan lebih dulu, yang mengisi waktu adalah apa pun yang paling mendesak saat itu. Pekerjaan hampir selalu memenangkan perbandingan itu karena tenggatnya jelas dan akibatnya terlihat, sementara makan malam bersama keluarga tidak pernah mengirim pengingat.",
      },
      {
        kind: "list",
        id: "art-5-b4",
        ordered: false,
        items: [
          "Tentukan satu hal yang dilindungi, bukan sepuluh. Satu batas yang dijaga konsisten lebih berpengaruh daripada daftar panjang yang runtuh pada minggu kedua.",
          "Sampaikan batasnya sebagai informasi, bukan permintaan izin. “Saya tidak online setelah jam sembilan” lebih mudah dihormati daripada “boleh tidak kalau saya tidak online?”.",
          "Siapkan satu kalimat cadangan untuk permintaan mendadak, supaya kamu tidak perlu menyusun jawaban dalam keadaan tertekan.",
          "Perkirakan reaksi awal yang kurang enak. Batas baru hampir selalu terasa mengganggu pada awalnya, dan itu bukan tanda batasnya salah.",
        ],
      },
      {
        kind: "quote",
        id: "art-5-b5",
        text: "Batas bukan cara menghindari pekerjaan. Batas adalah cara memastikan masih ada sesuatu yang tersisa ketika pekerjaan sedang berat.",
        attribution: "Eka Nurhaliza, M.Psi., Psikolog",
      },
      {
        kind: "paragraph",
        id: "art-5-b6",
        text: "Perlu dikatakan jujur bahwa tidak semua orang punya ruang yang sama untuk menetapkan batas. Pekerjaan dengan jam yang tidak bisa ditawar atau atasan yang tidak menerima penolakan membuat sebagian saran di atas sulit dijalankan. Dalam keadaan seperti itu, yang paling masuk akal biasanya bukan memaksakan batas, melainkan membicarakan bebannya secara terbuka dengan orang yang punya wewenang mengubahnya.",
      },
    ],
    createdAt: "2026-06-20T02:00:00.000Z",
  },
  {
    id: "art-6",
    slug: "bicara-kesehatan-mental-dengan-orang-tua",
    title: "Bicara soal Kesehatan Mental dengan Orang Tua",
    excerpt:
      "Beda generasi bikin istilahnya tidak nyambung. Kadang yang perlu diubah bukan isinya, tapi cara masuknya.",
    coverImageUrl: null,
    topic: topics.hubungan,
    author: people.gita,
    reviewer: people.anindita,
    reviewedAt: "2026-06-12T00:00:00.000Z",
    publishedAt: "2026-06-15T02:00:00.000Z",
    readTimeMinutes: 2,
    body: [
      {
        kind: "paragraph",
        id: "art-6-b1",
        text: "Percakapan ini sering gagal bukan karena orang tua tidak peduli, melainkan karena kata-kata yang dipakai tidak punya arti yang sama di kedua sisi. Istilah seperti terapi atau kesehatan mental bisa terdengar sebagai kabar bahwa ada sesuatu yang sangat serius, sedangkan yang dimaksud anaknya jauh lebih sederhana.",
      },
      {
        kind: "heading",
        id: "art-6-b2",
        text: "Mulai dari keluhan, bukan dari istilah",
      },
      {
        kind: "paragraph",
        id: "art-6-b3",
        text: "Bahasa yang paling mudah diterima biasanya bahasa keseharian: susah tidur, gampang marah, tidak nafsu makan, tidak bisa konsentrasi di kantor. Keluhan seperti itu tidak menuntut pendengarnya menerima satu kerangka berpikir tertentu lebih dulu, dan karena itu tidak langsung memicu bantahan.",
      },
      {
        kind: "list",
        id: "art-6-b4",
        ordered: false,
        items: [
          "Pilih waktu yang tenang dan bukan di tengah perselisihan, supaya isi pembicaraan tidak terbaca sebagai bagian dari pertengkaran.",
          "Ceritakan pengaruhnya pada hal yang mereka lihat sendiri, misalnya pekerjaan atau kesehatan fisik.",
          "Kalau perlu, pakai perbandingan dengan pemeriksaan kesehatan biasa. Banyak orang lebih mudah menerima gagasan memeriksakan diri daripada gagasan berobat jiwa.",
          "Jangan menuntut mereka langsung mengerti. Percakapan pertama yang berhasil biasanya percakapan yang tidak berakhir dengan penolakan, bukan yang berakhir dengan persetujuan.",
        ],
      },
      {
        kind: "quote",
        id: "art-6-b5",
        text: "Sering kali yang ditolak orang tua bukan pertolongannya, melainkan kesan bahwa mereka gagal sebagai orang tua. Kalau kesan itu bisa dihindari, percakapannya jadi jauh lebih mudah.",
        attribution: "Gita Maheswari, M.Psi., Psikolog",
      },
      {
        kind: "heading",
        id: "art-6-b6",
        text: "Kalau penolakannya tetap keras",
      },
      {
        kind: "paragraph",
        id: "art-6-b7",
        text: "Ada keluarga yang butuh waktu lama, dan ada yang tidak pernah benar-benar menerima. Kalau itu yang terjadi, keputusan untuk mencari bantuan tetap boleh diambil tanpa restu, terutama bagi orang dewasa yang mampu memutuskan sendiri. Persetujuan keluarga membuat prosesnya lebih ringan, tetapi ketiadaannya bukan alasan untuk menunda.",
      },
      {
        kind: "paragraph",
        id: "art-6-b8",
        text: "Dalam keadaan itu, mencari satu orang pendukung lain sering lebih berguna daripada terus meyakinkan pihak yang menolak. Saudara, pasangan, atau teman dekat yang bersedia menemani biasanya cukup untuk membuat langkah pertama terasa mungkin.",
      },
    ],
    createdAt: "2026-06-09T02:00:00.000Z",
  },
  {
    id: "art-7",
    slug: "sesi-pertama-dengan-psikolog",
    title: "Apa yang Terjadi di Sesi Pertama dengan Psikolog",
    excerpt:
      "Sesi pertama biasanya lebih banyak berisi perkenalan dan pemetaan, bukan langsung penanganan. Mengetahui itu bisa mengurangi cemas.",
    coverImageUrl: null,
    topic: topics.pengembanganDiri,
    author: people.hendra,
    reviewer: people.intan,
    reviewedAt: "2026-06-03T00:00:00.000Z",
    publishedAt: "2026-06-06T02:00:00.000Z",
    readTimeMinutes: 2,
    body: [
      {
        kind: "paragraph",
        id: "art-7-b1",
        text: "Sebagian besar rasa gugup menjelang sesi pertama datang dari tidak tahu apa yang akan terjadi. Gambaran yang beredar sering berasal dari film: ruangan gelap, sofa panjang, dan pertanyaan tentang masa kecil. Kenyataannya jauh lebih biasa dan jauh lebih menyerupai percakapan.",
      },
      {
        kind: "heading",
        id: "art-7-b2",
        text: "Yang umumnya terjadi",
      },
      {
        kind: "list",
        id: "art-7-b3",
        ordered: true,
        items: [
          "Penjelasan mengenai kerahasiaan dan batasannya, termasuk keadaan tertentu yang mengharuskan informasi dibagikan demi keselamatan.",
          "Pertanyaan tentang apa yang membuatmu datang sekarang, bukan hanya apa yang kamu rasakan, karena waktu kedatangan sering memberi petunjuk.",
          "Pemetaan keadaan sehari-hari: tidur, pekerjaan, hubungan dekat, kesehatan fisik, dan hal-hal yang sedang berubah.",
          "Kesepakatan mengenai arah dan jumlah pertemuan berikutnya, yang sifatnya perkiraan awal dan bisa berubah.",
        ],
      },
      {
        kind: "paragraph",
        id: "art-7-b4",
        text: "Kamu tidak harus bercerita runtut dan tidak harus tahu apa masalahmu sebelum datang. Menyusun cerita justru salah satu pekerjaan yang dilakukan bersama, dan mengatakan bahwa kamu belum tahu harus mulai dari mana adalah pembuka yang sepenuhnya wajar.",
      },
      {
        kind: "quote",
        id: "art-7-b5",
        text: "Tidak ada jawaban yang salah di sesi pertama. Kalau kamu bingung harus mulai dari mana, itu juga informasi yang berguna.",
        attribution: "Hendra Saputra, S.Psi., Konselor",
      },
      {
        kind: "heading",
        id: "art-7-b6",
        text: "Kalau terasa tidak cocok",
      },
      {
        kind: "paragraph",
        id: "art-7-b7",
        text: "Kecocokan antara klien dan profesional adalah bagian nyata dari proses, bukan soal selera semata. Kalau setelah beberapa pertemuan kamu merasa tidak nyaman atau tidak didengar, membicarakannya secara terbuka adalah hal yang wajar, begitu juga mencari profesional lain. Itu tidak dianggap sebagai kegagalan oleh siapa pun yang bekerja di bidang ini.",
      },
    ],
    createdAt: "2026-05-31T02:00:00.000Z",
  },
  {
    id: "art-8",
    slug: "trauma-tidak-selalu-kenangan-besar",
    title: "Trauma Tidak Selalu Berwujud Kenangan Besar",
    excerpt:
      "Peristiwa yang terlihat kecil dari luar bisa meninggalkan jejak panjang. Ukurannya bukan seberapa besar kejadiannya.",
    coverImageUrl: null,
    topic: topics.trauma,
    author: people.intan,
    reviewer: people.fajar,
    reviewedAt: "2026-05-25T00:00:00.000Z",
    publishedAt: "2026-05-28T02:00:00.000Z",
    readTimeMinutes: 3,
    body: [
      {
        kind: "paragraph",
        id: "art-8-b1",
        text: "Salah satu kalimat yang paling sering menghalangi orang mencari bantuan adalah penilaian bahwa yang dialaminya belum cukup berat. Ukuran yang dipakai biasanya besarnya peristiwa dari luar, padahal yang menentukan jejaknya adalah bagaimana peristiwa itu dialami dan apa yang tersedia bagi orang tersebut setelahnya.",
      },
      {
        kind: "heading",
        id: "art-8-b2",
        text: "Yang menentukan bukan besarnya kejadian",
      },
      {
        kind: "paragraph",
        id: "art-8-b3",
        text: "Dua orang bisa mengalami hal yang sama dan keluar dengan akibat yang sangat berbeda. Beberapa hal yang biasanya berpengaruh adalah seberapa tidak berdaya seseorang merasa saat itu, apakah ada orang yang menolong sesudahnya, apakah dia dipercaya ketika bercerita, dan apakah keadaan itu berulang atau berhenti.",
      },
      {
        kind: "paragraph",
        id: "art-8-b4",
        text: "Karena itu peristiwa yang dari luar terlihat sedang saja bisa meninggalkan jejak panjang, terutama kalau terjadi berulang dalam waktu lama, dilakukan oleh orang yang seharusnya melindungi, atau berlangsung ketika seseorang masih terlalu kecil untuk memahaminya.",
      },
      {
        kind: "heading",
        id: "art-8-b5",
        text: "Bentuknya sering tidak berupa ingatan",
      },
      {
        kind: "list",
        id: "art-8-b6",
        ordered: false,
        items: [
          "Reaksi tubuh yang muncul lebih dulu daripada pikirannya: jantung berdebar atau perut mual pada situasi tertentu tanpa alasan yang jelas.",
          "Kewaspadaan yang tidak pernah turun, misalnya selalu memeriksa jalan keluar atau sulit membelakangi pintu.",
          "Kekosongan atau rasa berjarak dari keadaan sekitar, seolah sedang menonton dan bukan menjalani.",
          "Penghindaran yang perlahan meluas, dari satu tempat menjadi satu jenis situasi, lalu menjadi banyak hal sekaligus.",
          "Ingatan yang justru kabur atau terputus-putus, yang sering keliru dianggap sebagai bukti bahwa kejadiannya tidak berarti.",
        ],
      },
      {
        kind: "quote",
        id: "art-8-b7",
        text: "Pertanyaan yang lebih berguna bukan “apakah ini cukup berat untuk disebut trauma”, melainkan “apakah ini masih memengaruhi cara saya menjalani hari ini”.",
        attribution: "Intan Larasati, M.Psi., Psikolog",
      },
      {
        kind: "heading",
        id: "art-8-b8",
        text: "Kenapa menceritakan ulang saja tidak selalu menolong",
      },
      {
        kind: "paragraph",
        id: "art-8-b9",
        text: "Ada anggapan bahwa menyembuhkan trauma berarti menceritakan kembali kejadiannya sedetail mungkin. Dalam praktiknya, menceritakan ulang tanpa persiapan dan tanpa pendampingan bisa membuat seseorang kembali kewalahan tanpa mendapat apa pun sebagai gantinya.",
      },
      {
        kind: "paragraph",
        id: "art-8-b10",
        text: "Karena itu penanganan trauma umumnya dimulai dari hal yang tampak tidak berhubungan: membangun rasa aman, mengenali tanda tubuh yang mulai kewalahan, dan menemukan cara menurunkannya. Bagian yang menyangkut peristiwanya baru dikerjakan setelah dasar itu ada.",
      },
      {
        kind: "heading",
        id: "art-8-b11",
        text: "Langkah pertama yang masuk akal",
      },
      {
        kind: "list",
        id: "art-8-b12",
        ordered: true,
        items: [
          "Berhenti mengukur apakah pengalamanmu layak disebut trauma. Ukuran itu tidak menolong dan sering hanya menunda.",
          "Perhatikan situasi yang membuat reaksimu jauh lebih besar daripada keadaannya. Pola itu biasanya lebih informatif daripada isi ingatan.",
          "Cari profesional yang menyebutkan penanganan trauma sebagai bidang kerjanya, dan tanyakan cara kerjanya pada pertemuan pertama.",
          "Jangan memaksakan diri menceritakan seluruhnya sekaligus. Kamu berhak mengatur kecepatannya.",
        ],
      },
      {
        kind: "paragraph",
        id: "art-8-b13",
        text: "Kalau ingatan atau reaksi itu datang begitu kuat sampai mengganggu keselamatanmu atau kemampuanmu menjalani hari, jangan menunggu sampai merasa cukup siap. Bawa ke psikolog atau psikiater dan mulailah dari keadaan hari ini, bukan dari peristiwanya.",
      },
    ],
    createdAt: "2026-05-22T02:00:00.000Z",
  },
  {
    id: "art-9",
    slug: "mendampingi-anak-yang-menarik-diri",
    title: "Mendampingi Anak yang Mulai Menarik Diri",
    excerpt:
      "Anak yang tiba-tiba diam bukan berarti tidak mau bicara. Sering kali dia belum punya kata untuk apa yang dirasakan.",
    coverImageUrl: null,
    topic: topics.pengasuhan,
    author: people.fajar,
    reviewer: people.dian,
    reviewedAt: "2026-05-14T00:00:00.000Z",
    publishedAt: "2026-05-17T02:00:00.000Z",
    readTimeMinutes: 2,
    body: [
      {
        kind: "paragraph",
        id: "art-9-b1",
        text: "Anak yang mendadak lebih pendiam sering dibaca sebagai fase, dan sebagian memang begitu. Yang perlu diperhatikan adalah perubahan yang bertahan dan menyeluruh: bukan hanya diam di rumah, tetapi juga mundur dari hal-hal yang dulu dia cari sendiri.",
      },
      {
        kind: "heading",
        id: "art-9-b2",
        text: "Perubahan yang layak diperhatikan",
      },
      {
        kind: "list",
        id: "art-9-b3",
        ordered: false,
        items: [
          "Berhenti dari kegiatan yang dulu disukainya tanpa penjelasan, terutama kalau kegiatan itu melibatkan teman.",
          "Perubahan pola tidur atau makan yang berjalan berminggu-minggu.",
          "Keluhan fisik berulang seperti sakit perut atau sakit kepala yang muncul pada waktu tertentu, misalnya menjelang berangkat sekolah.",
          "Nada bicara terhadap dirinya sendiri yang berubah menjadi keras, misalnya menyebut dirinya bodoh atau menyusahkan.",
          "Penurunan yang cukup tajam di sekolah pada anak yang sebelumnya tidak bermasalah.",
        ],
      },
      {
        kind: "heading",
        id: "art-9-b4",
        text: "Cara membuka pembicaraan",
      },
      {
        kind: "paragraph",
        id: "art-9-b5",
        text: "Pertanyaan langsung yang diajukan berhadap-hadapan sering justru membuat anak menutup diri, apalagi kalau terasa seperti pemeriksaan. Percakapan biasanya lebih mudah terjadi ketika dilakukan sambil melakukan hal lain, misalnya di perjalanan, saat memasak, atau saat mengerjakan sesuatu bersama.",
      },
      {
        kind: "list",
        id: "art-9-b6",
        ordered: true,
        items: [
          "Sebut yang kamu lihat, bukan kesimpulanmu. “Kamu kelihatan lebih capek belakangan ini” lebih mudah dijawab daripada “kamu kenapa sih”.",
          "Beri jeda dan tahan keinginan untuk mengisi diam. Anak sering butuh waktu lama sebelum menemukan kalimat pertamanya.",
          "Terima jawaban kecil tanpa langsung menuntut penjelasan lengkap, supaya bercerita tidak terasa berisiko.",
          "Tahan diri untuk tidak langsung menawarkan solusi. Nasihat yang datang terlalu cepat sering menghentikan cerita di tengah jalan.",
        ],
      },
      {
        kind: "quote",
        id: "art-9-b7",
        text: "Anak yang diam biasanya bukan sedang menolak bicara. Dia sedang mencari kata untuk sesuatu yang belum pernah dia alami sebelumnya.",
        attribution: "Fajar Ramadhan, dr., Sp.KJ",
      },
      {
        kind: "heading",
        id: "art-9-b8",
        text: "Kapan mencari bantuan",
      },
      {
        kind: "paragraph",
        id: "art-9-b9",
        text: "Kalau perubahannya sudah berjalan lebih dari beberapa minggu, mengganggu sekolah atau pertemanannya, atau kamu mendengar hal yang membuatmu khawatir akan keselamatannya, jangan menunggu fasenya lewat. Bicarakan dengan psikolog anak atau psikiater. Membawa anak untuk diperiksa bukan tanda kegagalan sebagai orang tua, dan bagi banyak anak justru menjadi bukti pertama bahwa keadaannya dianggap serius.",
      },
    ],
    createdAt: "2026-05-11T02:00:00.000Z",
  },
];

export async function getArticles(): Promise<Article[]> {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return articles.find((item) => item.slug === slug) ?? null;
}
export async function getArticleTopics(): Promise<ArticleTopic[]> {
  const bySlug = new Map<string, ArticleTopic>();
  for (const item of articles) {
    bySlug.set(item.topic.slug, item.topic);
  }
  return [...bySlug.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "id-ID"),
  );
}

export async function getRelatedArticles(
  slug: string,
  limit = 3,
): Promise<Article[]> {
  const current = articles.find((item) => item.slug === slug);
  if (!current) return [];

  const others = articles.filter((item) => item.slug !== slug);
  const sameTopic = others.filter(
    (item) => item.topic.slug === current.topic.slug,
  );
  const sameAuthor = others.filter(
    (item) =>
      item.author.id === current.author.id &&
      item.topic.slug !== current.topic.slug,
  );

  const ordered = [...sameTopic, ...sameAuthor, ...others];
  const unique = ordered.filter(
    (item, index) => ordered.findIndex((one) => one.id === item.id) === index,
  );

  return unique.slice(0, limit);
}
