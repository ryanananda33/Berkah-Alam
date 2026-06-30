import React from "react";
import { createClient } from "@/utils/supabase/server";
import PesananClient from "./PesananClient";

export default async function AdminPesananPage() {
  let orders: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch all orders including relational details
    const { data, error } = await supabase
      .from("pesanan")
      .select(`
        *,
        users:user_id (
          name,
          email,
          phone,
          address
        ),
        detail_pesanan (
          *,
          produk:produk_id (
            nama
          )
        ),
        pembayaran (
          *
        )
      `)
      .order("id", { ascending: false });

    if (data) {
      orders = data;
    }
  } catch (error) {
    console.error("Gagal memuat semua pesanan untuk admin CMS:", error);
  }

  return (
    <PesananClient 
      orders={orders} 
    />
  );
}
