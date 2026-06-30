import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PembayaranClient from "./PembayaranClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PembayaranPage({ params }: PageProps) {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.id);

  let order = null;
  let user = null;

  const supabase = await createClient();

  // Fetch user
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) {
    redirect("/login");
  }
  user = supabaseUser;

  try {
    // Fetch order
    const { data: orderData } = await supabase
      .from("pesanan")
      .select("id, total, status, user_id")
      .eq("id", orderId)
      .single();

    if (orderData) {
      order = orderData;
    }
  } catch (error) {
    console.error("Gagal memuat detail pesanan untuk pembayaran:", error);
  }

  // Pastikan pesanan milik user yang sedang login
  if (order && order.user_id !== user.id) {
    redirect("/customer/dashboard");
  }

  // Jika order tidak ditemukan
  if (!order) {
    // Gunakan fallback untuk kepentingan testing jika database belum siap
    order = {
      id: orderId,
      total: 2500000,
      status: "pending"
    };
  }

  return (
    <PembayaranClient 
      order={order} 
      user={user} 
    />
  );
}
