export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BERKAH ALAM - Batu Nisan, Prasasti, & Ukiran Batu Alam Premium",
  description: "Mewujudkan penghormatan terindah untuk orang-orang yang Anda cintai, dengan keahlian dan dedikasi penuh di atas batu alam abadi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (supabaseUser) {
      user = supabaseUser;
      
      // Mengambil profil dari tabel public.users
      const { data: profileData } = await supabase
        .from("users")
        .select("name, role")
        .eq("id", user.id)
        .single();
        
      if (profileData) {
        profile = profileData;
      } else {
        // Fallback jika profil belum ter-sinkronisasi di tabel public.users
        profile = {
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          role: user.user_metadata?.role || "customer",
        };
      }
    }
  } catch (error) {
    console.error("Gagal memuat sesi pengguna di Layout:", error);
  }

  // Ambil request pathname dari middleware header
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="id"
      className={`${inter.variable} ${cormorant.variable} ${poppins.variable} h-full antialiasedScroll scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-stone-bg text-stone-800">
        {/* Glowing fluid blurs (Liquid Glass effect) - hanya tampil di area publik */}
        {!isAdmin && (
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="blob bg-[#E2C799] w-[50vw] h-[50vw] -top-[10%] -left-[15%] opacity-30"></div>
            <div className="blob bg-[#D3E0EA] w-[45vw] h-[45vw] -bottom-[5%] -right-[10%] opacity-35" style={{ animationDelay: "-5s" }}></div>
            <div className="blob bg-[#E2C799] w-[30vw] h-[30vw] top-[50%] left-[75%] opacity-20" style={{ animationDelay: "-10s" }}></div>
          </div>
        )}

        {!isAdmin && <Navbar user={user} profile={profile} />}
        
        <main className="flex-grow">
          {children}
        </main>

        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
