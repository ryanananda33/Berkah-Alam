import React from "react";
import { createClient } from "@/utils/supabase/server";
import KategoriClient from "./KategoriClient";

export default async function AdminKategoriPage() {
  let categories: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch categories
    const { data } = await supabase
      .from("kategori")
      .select("*")
      .order("id", { ascending: true });

    if (data) {
      categories = data;
    }
  } catch (error) {
    console.error("Gagal memuat kategori:", error);
  }

  return (
    <KategoriClient 
      categories={categories} 
    />
  );
}
