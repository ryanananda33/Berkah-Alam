import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { 
  CheckCircle2, 
  Brush, 
  PenTool, 
  Truck, 
  ArrowDown, 
  ArrowRight,
  UserPlus,
  ShoppingBag,
  FileText,
  Upload
} from "lucide-react";

// Tipe data interface
interface Kategori {
  id: number;
  nama: string;
}

interface Produk {
  id: number;
  kategori_id: number;
  nama: string;
  harga: number;
  stok: number;
  deskripsi: string;
  gambar: string;
  kategori?: Kategori | null;
}

interface Hero {
  id: number;
  judul: string;
  subjudul: string;
  gambar: string;
}

export default async function Home() {
  let heroes: Hero[] = [];
  let products: Produk[] = [];
  let categories: Kategori[] = [];

  // Data Fallback jika database belum dikonfigurasi atau kosong
  const fallbackHero = {
    judul: "BERKAH ALAM",
    subjudul: "Menghadirkan Batu Nisan, Prasasti, dan Monumen Berkualitas dengan Sentuhan Seni dan Presisi.",
    gambar: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1920&q=80",
  };

  const fallbackCategories = [
    { id: 1, nama: "Batu Nisan" },
    { id: 2, nama: "Prasasti Peresmian" },
    { id: 3, nama: "Monumen & Papan Nama" },
    { id: 4, nama: "Relief & Ukiran Hias" },
  ];

  const fallbackProducts = [
    {
      id: 1,
      kategori_id: 1,
      nama: "Nisan Granit Hitam Book Premium",
      harga: 2750000,
      stok: 8,
      deskripsi: "Nisan model buku terbuka dari batu Granit Hitam murni (Black Nero). Pahat nama secara mendalam dengan finishing cat emas metalik khusus yang sangat awet.",
      gambar: "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=800&q=80",
      kategori: { id: 1, nama: "Batu Nisan" }
    },
    {
      id: 2,
      kategori_id: 1,
      nama: "Nisan Dome Marmer Putih Citatah",
      harga: 3100000,
      stok: 5,
      deskripsi: "Nisan model kubah bulat dengan bahan dasar Marmer Putih asli Citatah. Permukaan sangat halus mengkilap, tahan perubahan cuaca ekstrim luar ruangan.",
      gambar: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
      kategori: { id: 1, nama: "Batu Nisan" }
    },
    {
      id: 3,
      kategori_id: 2,
      nama: "Prasasti Peresmian Marmer Itali",
      harga: 1450000,
      stok: 15,
      deskripsi: "Prasasti untuk peresmian gedung, jalan, atau proyek dari bahan Marmer Itali berukuran 40x60cm. Pahat tulisan rapi dan diisi warna emas berkilau.",
      gambar: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
      kategori: { id: 2, nama: "Prasasti Peresmian" }
    },
    {
      id: 4,
      kategori_id: 3,
      nama: "Papan Nama Instansi Batu Granit",
      harga: 7500000,
      stok: 3,
      deskripsi: "Papan nama kantor instansi pemerintah atau swasta berukuran besar (120x80cm) dari lempengan batu granit tebal dengan ornamen pahatan logo kustom.",
      gambar: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      kategori: { id: 3, nama: "Monumen & Papan Nama" }
    }
  ];

  try {
    const supabase = await createClient();
    
    // Fetch Hero
    const { data: heroData } = await supabase
      .from("hero")
      .select("*")
      .order("id", { ascending: true });
    if (heroData && heroData.length > 0) {
      heroes = heroData;
    }

    // Fetch Categories
    const { data: catData } = await supabase
      .from("kategori")
      .select("*")
      .order("id", { ascending: true });
    if (catData && catData.length > 0) {
      categories = catData;
    }

    // Fetch Products with relations
    const { data: prodData } = await supabase
      .from("produk")
      .select(`
        *,
        kategori:kategori_id(id, nama)
      `)
      .order("id", { ascending: true });
    if (prodData && prodData.length > 0) {
      products = prodData as unknown as Produk[];
    }
  } catch (error) {
    console.error("Gagal mengambil data dari Supabase, menggunakan data fallback:", error);
  }

  // Assign fallbacks if empty
  const activeHero = heroes[0] || fallbackHero;
  const activeProducts = products.length > 0 ? products : fallbackProducts;
  const activeCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section 
        className="relative h-[90vh] min-h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url('${activeHero.gambar}')`,
          backgroundAttachment: "fixed"
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-6 inline-block">
            <span className="font-sans text-[10px] tracking-[3px] text-white border border-white/40 bg-white/10 px-5 py-2 rounded-full uppercase font-semibold backdrop-blur-[5px]">
              Sejak 2000
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl font-semibold leading-tight text-white mb-6 tracking-wide drop-shadow-md">
            Penghormatan <span className="font-serif italic text-accent font-medium">Berkah Alam</span><br />
            untuk yang Tercinta
          </h1>

          <p className="font-sans text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-white/90 mb-10 drop-shadow-sm font-light">
            {activeHero.subjudul}
          </p>

          <div>
            <Link 
              href="#produk" 
              className="inline-flex items-center gap-2 border-2 border-white hover:bg-white text-white hover:text-primary font-sans text-xs tracking-[2px] font-semibold py-4 px-10 rounded-full uppercase transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Lihat Koleksi &nbsp;&darr;
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
          <span className="font-sans text-[9px] tracking-[3px] text-white/60 uppercase font-medium">Scroll</span>
          <div className="w-[1px] h-12 bg-white/40 mt-2 animate-pulse"></div>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang" className="py-24 bg-white border-t border-stone-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[480px] w-full">
              <img 
                src="https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1280&q=80" 
                alt="Tentang Berkah Alam" 
                className="w-full h-full object-cover shadow-md border border-white"
              />
            </div>
            <div>
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
                Tentang Kami
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-primary mb-6 leading-tight">
                Dedikasi Seni Di Atas Batu Alam Abadi
              </h2>
              <p className="text-stone-500 leading-relaxed mb-6 text-justify font-light text-sm sm:text-base">
                BERKAH ALAM adalah workshop kerajinan batu alam spesialis pembuat Batu Nisan, Prasasti Peresmian, Papan Nama Instansi, Monumen, serta berbagai ukiran relief batu alam kustom. Berdiri dengan komitmen menghadirkan kualitas terbaik bagi setiap pelanggan.
              </p>
              <p className="text-stone-500 leading-relaxed mb-8 text-justify font-light text-sm sm:text-base">
                Kami hanya menggunakan bahan baku batu alam pilihan seperti Granit Hitam (Black Nero), Marmer Putih Citatah, Batu Kali, hingga Batu Paras Jogja. Setiap goresan ukiran dikerjakan secara manual oleh pengrajin berpengalaman demi mencapai tingkat kedalaman, kerapian, dan estetika yang tinggi.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-stone-200">
                <div>
                  <h4 className="font-serif text-4xl font-bold text-primary mb-1">100%</h4>
                  <p className="text-xs text-stone-400 font-sans uppercase tracking-wider">Bahan Batu Alam & Marmer Asli</p>
                </div>
                <div>
                  <h4 className="font-serif text-4xl font-bold text-primary mb-1">25+ Tahun</h4>
                  <p className="text-xs text-stone-400 font-sans uppercase tracking-wider">Pengalaman Seni Ukir Batu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section className="py-24 bg-stone-100/50 border-t border-stone-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
              Mengapa Kami
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-primary mb-4 leading-tight">
              Keunggulan Berkah Alam
            </h2>
            <p className="text-stone-500 font-light max-w-lg mx-auto">
              Kami berfokus pada hasil karya yang tahan lama, estetis, dan bernilai seni tinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="premium-card rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <CheckCircle2 size={28} />
              </div>
              <h5 className="font-serif text-xl font-bold text-primary mb-3">Bahan Kualitas Terbaik</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                Hanya menggunakan batu alam utuh berkualitas tanpa sambungan.
              </p>
            </div>
            {/* Card 2 */}
            <div className="premium-card rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Brush size={28} />
              </div>
              <h5 className="font-serif text-xl font-bold text-primary mb-3">Pahat Seni Manual</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                Pengerjaan pahatan yang presisi oleh seniman ukir lokal berpengalaman.
              </p>
            </div>
            {/* Card 3 */}
            <div className="premium-card rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <PenTool size={28} />
              </div>
              <h5 className="font-serif text-xl font-bold text-primary mb-3">Desain Kustom</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                Desain tulisan dan ornamentasi kaligrafi dapat disesuaikan keinginan.
              </p>
            </div>
            {/* Card 4 */}
            <div className="premium-card rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Truck size={28} />
              </div>
              <h5 className="font-serif text-xl font-bold text-primary mb-3">Pengiriman Aman</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                Proteksi kemasan peti kayu tebal untuk pengiriman ke seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Produk Unggulan Section */}
      <section id="produk" className="py-24 bg-white border-t border-stone-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
              Koleksi Produk
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-primary mb-4 leading-tight">
              Karya Unggulan Kami
            </h2>
            <p className="text-stone-500 font-light max-w-lg mx-auto">
              Jelajahi produk batu alam terbaik yang siap kami pahat dengan detail tulisan kustom dari Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeProducts.map((product) => (
              <div key={product.id} className="premium-card rounded-2xl overflow-hidden flex flex-col">
                <div className="relative h-64 w-full bg-stone-50 overflow-hidden">
                  <span className="absolute top-4 left-4 z-10 font-sans text-[10px] tracking-wider bg-accent text-white px-3 py-1 rounded-full uppercase font-bold shadow-sm">
                    {product.kategori?.nama || "Batu Alam"}
                  </span>
                  <img 
                    src={product.gambar} 
                    alt={product.nama} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif text-2xl font-semibold text-primary mb-2">
                      {product.nama}
                    </h5>
                    <p className="text-stone-400 text-xs sm:text-sm font-light mb-4 line-clamp-2 min-h-[40px]">
                      {product.deskripsi}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-100 mt-auto">
                    <div className="text-accent text-xl font-bold font-sans mb-4">
                      Rp {product.harga.toLocaleString("id-ID")}
                    </div>
                    <Link 
                      href={`/customer/produk/${product.id}`}
                      className="w-full flex items-center justify-center gap-2 border border-accent hover:bg-accent text-accent hover:text-white font-sans text-xs tracking-widest font-semibold py-3 px-6 rounded-full uppercase transition-all duration-300 shadow-sm"
                    >
                      Lihat Detail & Pesan <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alur Pemesanan Section */}
      <section className="py-24 bg-stone-100/50 border-t border-b border-stone-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
              Alur Transaksi
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-medium text-primary mb-4 leading-tight">
              Cara Melakukan Pemesanan
            </h2>
            <p className="text-stone-500 font-light max-w-lg mx-auto">
              Ikuti langkah mudah berikut untuk memesan nisan atau prasasti kustom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold font-sans text-lg mb-4 shadow-md">
                1
              </div>
              <h5 className="font-serif text-lg font-bold text-primary mb-2">Registrasi Akun</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed max-w-[200px]">
                Daftarkan diri Anda untuk masuk ke sistem pesanan kami.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold font-sans text-lg mb-4 shadow-md">
                2
              </div>
              <h5 className="font-serif text-lg font-bold text-primary mb-2">Pilih Produk</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed max-w-[200px]">
                Pilih ukuran dan jenis bahan (marmer, granit hitam) yang disukai.
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold font-sans text-lg mb-4 shadow-md">
                3
              </div>
              <h5 className="font-serif text-lg font-bold text-primary mb-2">Tulis Teks Nisan</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed max-w-[200px]">
                Isi catatan ukiran (contoh: Nama Almarhum, bin/binti, Lahir & Wafat).
              </p>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold font-sans text-lg mb-4 shadow-md">
                4
              </div>
              <h5 className="font-serif text-lg font-bold text-primary mb-2">Unggah Bukti Bayar</h5>
              <p className="text-xs text-stone-500 font-light leading-relaxed max-w-[200px]">
                Transfer pembayaran dan unggah bukti transfer agar pesanan diproses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
