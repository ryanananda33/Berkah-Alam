import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function CustomerDashboardPage() {
  let user = null;
  let orders: any[] = [];
  let stats = {
    total_orders: 0,
    pending: 0,
    processed: 0,
    completed: 0,
  };

  const supabase = await createClient();

  // 1. Get logged in user
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) {
    redirect("/login");
  }
  user = supabaseUser;

  try {

    // 2. Fetch orders for this user, including details and payments
    const { data: ordersData, error: ordersError } = await supabase
      .from("pesanan")
      .select(`
        *,
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
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (ordersData) {
      orders = ordersData;
      
      // Calculate stats
      const total_orders = orders.length;
      let pending = 0;
      let processed = 0;
      let completed = 0;

      orders.forEach((order) => {
        if (order.status === "pending") {
          pending++;
        } else if (order.status === "diverifikasi" || order.status === "diproses") {
          processed++;
        } else if (order.status === "selesai") {
          completed++;
        }
      });

      stats = {
        total_orders,
        pending,
        processed,
        completed,
      };
    }
  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
  }

  return (
    <DashboardClient 
      orders={orders} 
      stats={stats} 
      user={user} 
    />
  );
}
