'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, User, Phone, MapPin, Loader2, ArrowLeft } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const supabase = createClient()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Cek jika user sudah login
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          router.push('/customer/dashboard')
        } else {
          setCheckingAuth(false)
        }
      } catch (err) {
        console.error('Gagal mengecek sesi login di register:', err)
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal harus 6 karakter.')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'customer', // Default role
            phone,
            address,
          }
        }
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Karena trigger DB langsung menyalin data metadata ini ke public.users
        // Sesi login biasanya langsung aktif, arahkan ke dashboard customer
        router.refresh()
        router.push('/customer/dashboard')
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-bg">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
  }

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center px-4 bg-cover bg-center py-12"
      style={{
        backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.4)), url('https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=1280&q=80')"
      }}
    >
      {/* Glassmorphic card container */}
      <div className="relative z-10 w-full max-w-md bg-white/45 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10">
        
        <div className="absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center justify-center p-2 rounded-full border border-stone-300/50 hover:bg-stone-100/50 text-stone-600 transition-all">
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="text-center mt-6 mb-8">
          <h2 className="font-serif text-3xl font-semibold text-primary mb-2">
            Buat Akun Baru
          </h2>
          <p className="font-sans text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
            Daftarkan diri Anda untuk mulai melakukan pemesanan nisan atau prasasti.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs leading-relaxed font-sans">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="email" 
              placeholder="Alamat Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="tel" 
              placeholder="Nomor Telepon (WhatsApp)" 
              required 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Alamat Lengkap" 
              required 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="password" 
              placeholder="Kata Sandi" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="password" 
              placeholder="Konfirmasi Kata Sandi" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white hover:text-white font-sans text-xs tracking-widest font-semibold py-4 rounded-2xl uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-stone-500 font-sans">
          Sudah punya akun? <Link href="/login" className="text-accent font-semibold hover:underline">Masuk sekarang</Link>
        </div>
      </div>
    </div>
  )
}
