'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Menu, X, LogOut, Shield, LayoutDashboard } from 'lucide-react'

interface NavbarProps {
  user: any
  profile: {
    name: string
    role: string
  } | null
}

export default function Navbar({ user, profile }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="font-serif text-2xl font-medium tracking-wide text-primary">
              Berkah Alam <span className="font-serif italic text-accent font-medium">Memorial</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/#produk" className="text-sm font-sans font-medium tracking-widest uppercase text-stone-600 hover:text-accent transition-colors">
              Katalog
            </Link>
            
            {user ? (
              <>
                {profile?.role === 'admin' ? (
                  <Link href="/admin/dashboard" className="inline-flex items-center gap-2 bg-accent border border-accent hover:bg-transparent text-white hover:text-accent font-semibold px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all shadow-md hover:shadow-lg shadow-accent/20">
                    <Shield size={14} /> Admin Panel
                  </Link>
                ) : (
                  <Link href="/customer/dashboard" className="inline-flex items-center gap-2 bg-accent border border-accent hover:bg-transparent text-white hover:text-accent font-semibold px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all shadow-md hover:shadow-lg shadow-accent/20">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center border border-accent text-accent hover:bg-accent hover:text-white px-4 py-2.5 rounded-full text-xs tracking-widest uppercase font-semibold transition-all shadow-sm"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link href="/login" className="inline-flex items-center bg-accent border border-accent hover:bg-transparent text-white hover:text-accent font-semibold px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all shadow-md hover:shadow-lg shadow-accent/20">
                Login / Register
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-stone-600 hover:text-accent focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-stone-200 py-4 px-6 space-y-4">
          <Link
            href="/#produk"
            onClick={() => setIsOpen(false)}
            className="block text-sm font-sans font-medium tracking-widest uppercase text-stone-600 hover:text-accent transition-colors"
          >
            Katalog
          </Link>
          
          {user ? (
            <div className="space-y-3 pt-2">
              {profile?.role === 'admin' ? (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 justify-center bg-accent text-white font-semibold py-3 rounded-full text-xs tracking-widest uppercase transition-all text-center w-full"
                >
                  <Shield size={14} /> Admin Panel
                </Link>
              ) : (
                <Link
                  href="/customer/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 justify-center bg-accent text-white font-semibold py-3 rounded-full text-xs tracking-widest uppercase transition-all text-center w-full"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
              )}
              
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-2 justify-center border border-accent text-accent font-semibold py-3 rounded-full text-xs tracking-widest uppercase transition-all w-full"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex justify-center bg-accent text-white font-semibold py-3 rounded-full text-xs tracking-widest uppercase transition-all text-center w-full pt-2"
            >
              Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
