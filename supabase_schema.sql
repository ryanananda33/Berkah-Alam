-- SQL Script untuk Setup Database Supabase (PostgreSQL)
-- Salin dan jalankan script ini di menu "SQL Editor" pada dashboard Supabase Anda.

-- 1. Hapus Tabel & Trigger Jika Sudah Ada (Hati-hati: Menghapus data yang ada)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.pembayaran CASCADE;
DROP TABLE IF EXISTS public.detail_pesanan CASCADE;
DROP TABLE IF EXISTS public.pesanan CASCADE;
DROP TABLE IF EXISTS public.produk CASCADE;
DROP TABLE IF EXISTS public.kategori CASCADE;
DROP TABLE IF EXISTS public.hero CASCADE;
DROP TABLE IF EXISTS public.galeri CASCADE;
DROP TABLE IF EXISTS public.testimoni CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. Pembuatan Tabel Users (Terkoneksi dengan Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mengaktifkan Row Level Security (RLS) di tabel users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy untuk Tabel Users
CREATE POLICY "Users can read all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can do anything" ON public.users FOR ALL USING (true);

-- 3. Trigger otomatis ketika User mendaftar melalui Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, phone, address)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Pembuatan Tabel Kategori
CREATE TABLE public.kategori (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Pembuatan Tabel Produk
CREATE TABLE public.produk (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kategori_id BIGINT REFERENCES public.kategori(id) ON DELETE CASCADE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  harga DECIMAL(15,2) NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0,
  deskripsi TEXT,
  gambar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Pembuatan Tabel Pesanan
CREATE TABLE public.pesanan (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  total DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'diverifikasi', 'diproses', 'selesai', 'ditolak')),
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Pembuatan Tabel Detail Pesanan
CREATE TABLE public.detail_pesanan (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pesanan_id BIGINT REFERENCES public.pesanan(id) ON DELETE CASCADE NOT NULL,
  produk_id BIGINT REFERENCES public.produk(id) ON DELETE CASCADE NOT NULL,
  qty INTEGER NOT NULL,
  harga DECIMAL(15,2) NOT NULL,
  catatan_ukiran TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Pembuatan Tabel Pembayaran
CREATE TABLE public.pembayaran (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pesanan_id BIGINT REFERENCES public.pesanan(id) ON DELETE CASCADE NOT NULL,
  bukti_pembayaran VARCHAR(255) NOT NULL,
  tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'diverifikasi', 'ditolak')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Pembuatan Tabel Hero Banner
CREATE TABLE public.hero (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  subjudul VARCHAR(255) NOT NULL,
  gambar VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Pembuatan Tabel Galeri
CREATE TABLE public.galeri (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  gambar VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Pembuatan Tabel Testimoni
CREATE TABLE public.testimoni (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  isi TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  foto VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Nonaktifkan RLS untuk tabel data operasional agar mudah dibaca-tulis oleh API backend (atau buat policy permissive jika ingin menggunakan RLS)
ALTER TABLE public.kategori DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.produk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesanan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_pesanan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeri DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimoni DISABLE ROW LEVEL SECURITY;

-- 12. Pengisian Data Awal (Seed Data)
INSERT INTO public.kategori (nama) VALUES
('Batu Nisan'),
('Prasasti Peresmian'),
('Monumen & Papan Nama'),
('Relief & Ukiran Hias');

INSERT INTO public.hero (judul, subjudul, gambar) VALUES
('BERKAH ALAM', 'Menghadirkan Batu Nisan, Prasasti, dan Monumen Berkualitas dengan Sentuhan Seni dan Presisi.', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1920&q=80');

INSERT INTO public.produk (kategori_id, nama, harga, stok, deskripsi, gambar) VALUES
(1, 'Nisan Granit Hitam Book Premium', 2750000.00, 8, 'Nisan model buku terbuka dari batu Granit Hitam murni (Black Nero). Pahat nama secara mendalam dengan finishing cat emas metalik khusus yang sangat awet.', 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=800&q=80'),
(1, 'Nisan Dome Marmer Putih Citatah', 3100000.00, 5, 'Nisan model kubah bulat dengan bahan dasar Marmer Putih asli Citatah. Permukaan sangat halus mengkilap, tahan perubahan cuaca ekstrim luar ruangan.', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80'),
(2, 'Prasasti Peresmian Marmer Itali', 1450000.00, 15, 'Prasasti untuk peresmian gedung, jalan, atau proyek dari bahan Marmer Itali berukuran 40x60cm. Pahat tulisan rapi dan diisi warna emas berkilau.', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80'),
(3, 'Papan Nama Instansi Batu Granit', 7500000.00, 3, 'Papan nama kantor instansi pemerintah atau swasta berukuran besar (120x80cm) dari lempengan batu granit tebal dengan ornamen pahatan logo kustom.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');

INSERT INTO public.galeri (judul, gambar) VALUES
('Pahatan Kaligrafi Arab Nisan', 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=500&q=80'),
('Prasasti Marmer Peresmian Gedung', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=500&q=80'),
('Stok Bahan Baku Batu Marmer Alam', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=500&q=80'),
('Proses Pemuatan Nisan ke Truk Pengiriman', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80');

INSERT INTO public.testimoni (nama, isi, rating) VALUES
('Bapak Joko Santoso', 'Hasil ukirannya sangat rapi dan dalam. Tulisan emas di granit hitamnya tampak sangat mewah. Sangat puas dengan pelayanan Berkah Alam.', 5),
('Ibu Rahayu Ningsih', 'Pemesanan prasasti peresmian kantor desa cepat selesai. Packing kayunya tebal dan aman sampai tujuan. Terima kasih!', 5),
('H. Ahmad Fauzi', 'Nisan marmer kustom untuk makam keluarga dikerjakan tepat waktu. Desain kaligrafinya indah sekali.', 5);
