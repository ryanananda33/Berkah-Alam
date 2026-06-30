'use client'

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Gem, 
  FolderHeart, 
  Image as ImageIcon, 
  Users, 
  Home, 
  ShieldCheck, 
  Menu, 
  X
} from "lucide-react";
import AdminLogoutButton from "./LogoutButton";

interface AdminSidebarClientProps {
  profileName: string;
}

export default function AdminSidebarClient({ profileName }: AdminSidebarClientProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/pesanan", label: "Kelola Pesanan", icon: ShoppingBag },
    { href: "/admin/produk", label: "Kelola Produk", icon: Gem },
    { href: "/admin/kategori", label: "Kelola Kategori", icon: FolderHeart },
    { href: "/admin/hero", label: "Hero Banner", icon: ImageIcon },
    { href: "/admin/customer", label: "Pelanggan", icon: Users },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between font-sans">
      <div>
        {/* Brand Logo Box */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center text-white shadow-[0_4px_10px_rgba(197,168,128,0.3)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-primary leading-none">Admin Panel</h1>
            <span className="text-[9px] text-stone-400 font-sans tracking-widest uppercase font-semibold">Berkah Alam</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <ul className="space-y-1.5 list-none pl-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4.5 py-3.5 rounded-2xl text-[13px] font-semibold tracking-wide transition-all ${
                    isActive 
                      ? "bg-accent text-white shadow-[0_4px_12px_rgba(197,168,128,0.3)]" 
                      : "text-stone-600 hover:text-primary hover:bg-stone-100"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-stone-400"} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Details */}
      <div className="pt-6 border-t border-stone-200/60 space-y-2">
        <div className="px-4 py-2 bg-stone-50 border border-stone-150 rounded-2xl">
          <span className="text-[10px] text-stone-400 block font-light uppercase tracking-wider">Login sebagai</span>
          <strong className="text-primary text-[11px] font-bold block truncate mt-0.5">{profileName}</strong>
        </div>
        
        <Link
          href="/"
          className="flex items-center gap-3 px-4.5 py-3 rounded-2xl text-[13px] font-semibold text-stone-600 hover:text-primary hover:bg-stone-100 transition-all"
        >
          <Home size={18} className="text-stone-400" /> Beranda Web
        </Link>
        
        <AdminLogoutButton />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-72 bg-white/85 backdrop-blur-2xl border-r border-stone-200/60 p-6 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-stone-250/50 px-6 py-4 z-30 w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold text-primary leading-none">Admin Panel</h1>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border border-stone-200 text-stone-600 hover:text-accent rounded-xl focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Sidebar */}
          <aside className="relative flex flex-col w-72 max-w-xs bg-white p-6 shadow-2xl h-full z-50 animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
