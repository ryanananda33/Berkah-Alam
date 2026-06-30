import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProductDetailClient from "./ProductDetailClient";

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

const fallbackProducts: Produk[] = [
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);

  let product: Produk | null = null;
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    
    // Fetch product
    const { data: prodData } = await supabase
      .from("produk")
      .select(`
        *,
        kategori:kategori_id(id, nama)
      `)
      .eq("id", productId)
      .single();

    if (prodData) {
      product = prodData as unknown as Produk;
    }

    // Fetch user & profile
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      user = supabaseUser;
      
      const { data: profileData } = await supabase
        .from("users")
        .select("name, role, address")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        profile = profileData;
      } else {
        profile = {
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          role: user.user_metadata?.role || "customer",
          address: user.user_metadata?.address || "",
        };
      }
    }
  } catch (error) {
    console.error("Gagal mengambil data produk dari Supabase, menggunakan fallback:", error);
  }

  // Jika DB gagal/kosong, gunakan data fallback
  if (!product) {
    product = fallbackProducts.find(p => p.id === productId) || null;
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailClient 
      product={product} 
      user={user} 
      profile={profile} 
    />
  );
}
