import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Users, Mail, Phone, MapPin } from "lucide-react";

export default async function AdminCustomerPage() {
  let customers: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch users who are customers
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("role", "customer")
      .order("name", { ascending: true });

    if (data) {
      customers = data;
    }
  } catch (error) {
    console.error("Gagal memuat data pelanggan:", error);
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary">Daftar Pelanggan</h2>
        <p className="text-stone-500 font-light text-sm">Kelola dan lihat informasi para pelanggan yang terdaftar.</p>
      </div>

      {/* Customer Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h5 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <Users size={20} className="text-accent" /> Pelanggan Terdaftar
        </h5>

        {customers.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-light text-sm">
            Belum ada pelanggan terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-stone-500">
              <thead className="text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                <tr>
                  <th scope="col" className="pb-3 px-4">Nama Pelanggan</th>
                  <th scope="col" className="pb-3 px-4">Email</th>
                  <th scope="col" className="pb-3 px-4">No. Telepon / WA</th>
                  <th scope="col" className="pb-3 px-4">Alamat Lengkap</th>
                  <th scope="col" className="pb-3 px-4">Tanggal Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-primary">{cust.name}</td>
                    <td className="py-4 px-4 text-stone-700">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-stone-400" /> {cust.email}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-700">
                      {cust.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-stone-400" /> {cust.phone}
                        </span>
                      ) : (
                        <span className="text-stone-300 italic text-xs">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-stone-600 max-w-xs truncate">
                      {cust.address ? (
                        <span className="flex items-start gap-1.5">
                          <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                          <span className="truncate">{cust.address}</span>
                        </span>
                      ) : (
                        <span className="text-stone-300 italic text-xs">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-stone-400 text-xs">
                      {cust.created_at ? new Date(cust.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
