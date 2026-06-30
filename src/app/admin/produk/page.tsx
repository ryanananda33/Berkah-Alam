import React from "react";
import { createClient } from "@/utils/supabase/server";
import ProdukClient from "./ProdukClient";

export default async function AdminProdukPage() {
  let products: any[] = [];
  let categories: any[] = [];

  try {
    const supabase = await createClient();

    // 1. Fetch categories for dropdown selection
    const { data: catData } = await supabase
      .from("kategori")
      .select("*")
      .order("id", { ascending: true });
    
    if (catData) {
      categories = catData;
    }

    // 2. Fetch products including their category name
    const { data: prodData } = await supabase
      .from("produk")
      .select(`
        *,
        kategori:kategori_id(id, nama)
      `)
      .order("id", { ascending: true });
      
    if (prodData) {
      products = prodData;
    }
  } catch (error) {
    console.error("Gagal memuat produk untuk admin CMS:", error);
  }

  return (
    <ProdukClient 
      products={products} 
      categories={categories} 
    />
  );
}
