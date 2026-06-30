import React from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { 
  DollarSign, 
  ShoppingBag, 
  Gem, 
  Users, 
  Hourglass, 
  ShieldCheck, 
  Settings, 
  CheckCircle, 
  XCircle,
  ArrowRight
} from "lucide-react";

export default async function AdminDashboardPage() {
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalProducts = 0;
  let totalCustomers = 0;
  let recentOrders: any[] = [];

  let statusCounts = {
    pending: 0,
    diverifikasi: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
  };

  try {
    const supabase = await createClient();

    // 1. Fetch total products count
    const { count: prodCount } = await supabase
      .from("produk")
      .select("*", { count: "exact", head: true });
    totalProducts = prodCount || 0;

    // 2. Fetch total customers count
    const { count: custCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");
    totalCustomers = custCount || 0;

    // 3. Fetch all orders to compute stats and revenue
    const { data: ordersData } = await supabase
      .from("pesanan")
      .select("total, status");
    
    if (ordersData) {
      totalOrders = ordersData.length;
      
      ordersData.forEach((order) => {
        // Status counts
        if (order.status in statusCounts) {
          statusCounts[order.status as keyof typeof statusCounts]++;
        }
        
        // Revenue (sum total for verified, in-progress, and completed orders)
        if (["diverifikasi", "diproses", "selesai"].includes(order.status)) {
          totalRevenue += Number(order.total);
        }
      });
    }

    // 4. Fetch recent transactions
    const { data: recOrders } = await supabase
      .from("pesanan")
      .select(`
        id,
        total,
        status,
        users:user_id (
          name
        )
      `)
      .order("id", { ascending: false })
      .limit(5);

    if (recOrders) {
      recentOrders = recOrders;
    }
  } catch (error) {
    console.error("Gagal memuat data statistik dashboard admin:", error);
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary">Dashboard Utama</h2>
        <p className="text-stone-500 font-light text-sm">Ringkasan bisnis dan performa transaksi UMKM Berkah Alam.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-sans tracking-wider block uppercase font-semibold">Total Pendapatan</span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-primary mt-0.5">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <ShoppingBag size={24} className="text-stone-600" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-sans tracking-wider block uppercase font-semibold">Jumlah Pesanan</span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-primary mt-0.5">{totalOrders}</h3>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Gem size={24} className="text-stone-600" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-sans tracking-wider block uppercase font-semibold">Jumlah Produk</span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-primary mt-0.5">{totalProducts}</h3>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Users size={24} className="text-stone-600" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-sans tracking-wider block uppercase font-semibold">Pelanggan Terdaftar</span>
            <h3 className="font-sans font-bold text-lg sm:text-xl text-primary mt-0.5">{totalCustomers}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <h5 className="font-serif text-xl font-bold text-primary mb-6">Status Pemesanan</h5>
          <ul className="space-y-4 font-sans text-sm">
            <li className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="flex items-center gap-2 text-stone-600">
                <Hourglass size={16} className="text-amber-500" /> Pending (Belum Bayar)
              </span>
              <span className="font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs">
                {statusCounts.pending}
              </span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="flex items-center gap-2 text-stone-600">
                <ShieldCheck size={16} className="text-blue-500" /> Diverifikasi (Lunas)
              </span>
              <span className="font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                {statusCounts.diverifikasi}
              </span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="flex items-center gap-2 text-stone-600">
                <Settings size={16} className="text-purple-500 animate-spin-slow" /> Diproses (Dipahat)
              </span>
              <span className="font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                {statusCounts.diproses}
              </span>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-stone-100">
              <span className="flex items-center gap-2 text-stone-600">
                <CheckCircle size={16} className="text-emerald-500" /> Selesai (Kirim/Ambil)
              </span>
              <span className="font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs">
                {statusCounts.selesai}
              </span>
            </li>
            <li className="flex justify-between items-center py-2">
              <span className="flex items-center gap-2 text-stone-600">
                <XCircle size={16} className="text-red-500" /> Ditolak
              </span>
              <span className="font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs">
                {statusCounts.ditolak}
              </span>
            </li>
          </ul>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h5 className="font-serif text-xl font-bold text-primary mb-0">Transaksi Terbaru</h5>
            <Link 
              href="/admin/pesanan" 
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 font-semibold"
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-stone-400 font-light text-sm">
              Belum ada transaksi pemesanan masuk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-stone-500">
                <thead className="text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                  <tr>
                    <th scope="col" className="pb-3">Order ID</th>
                    <th scope="col" className="pb-3">Customer</th>
                    <th scope="col" className="pb-3">Total</th>
                    <th scope="col" className="pb-3">Status</th>
                    <th scope="col" className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 font-semibold text-primary">#BA-{order.id}</td>
                      <td className="py-4 text-stone-700">{order.users?.name || "Pelanggan"}</td>
                      <td className="py-4 font-bold text-accent">Rp {order.total.toLocaleString("id-ID")}</td>
                      <td className="py-4">
                        {order.status === "pending" && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded-full">Pending</span>}
                        {order.status === "diverifikasi" && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded-full">Diverifikasi</span>}
                        {order.status === "diproses" && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] uppercase font-bold rounded-full">Diproses</span>}
                        {order.status === "selesai" && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded-full">Selesai</span>}
                        {order.status === "ditolak" && <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] uppercase font-bold rounded-full">Ditolak</span>}
                      </td>
                      <td className="py-4 text-right">
                        <Link 
                          href={`/admin/pesanan?id=${order.id}`}
                          className="text-xs text-primary border border-stone-200 hover:border-primary font-semibold py-1 px-3.5 rounded-lg transition-all"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
