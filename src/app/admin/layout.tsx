export const dynamic = "force-dynamic";

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminSidebarClient from "./AdminSidebarClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = null;

  const supabase = await createClient();

  // 1. Ambil session user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    // 2. Cek apakah user adalah admin
    const { data: profileData } = await supabase
      .from("users")
      .select("role, name")
      .eq("id", user.id)
      .single();

    if (profileData) {
      profile = profileData;
    }
  } catch (error) {
    console.error("Gagal melakukan pengecekan hak akses admin:", error);
  }

  if (!profile || profile.role !== "admin") {
    // Jika bukan admin, tendang ke homepage
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row print:block">
      {/* Sidebar Admin Client */}
      <AdminSidebarClient profileName={profile?.name || "Admin"} />

      {/* Main Content Area - Tergeser 72 (280px) di desktop */}
      <div className="flex-grow md:pl-72 min-h-screen flex flex-col print:pl-0">
        <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
