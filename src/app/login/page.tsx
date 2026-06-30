'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Cek apakah user sudah masuk, jika ya langsung redirect
  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Ambil profil untuk menentukan tujuan
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          if (profile?.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/customer/dashboard')
          }
        } else {
          setCheckingAuth(false)
        }
      } catch (err) {
        console.error('Gagal mengecek sesi login:', err)
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials' 
          ? 'Email atau password yang Anda masukkan salah.' 
          : error.message
        )
        setLoading(false)
        return;
      }

      if (data.user) {
        // Ambil profil
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single()
        
        router.refresh()
        if (profile?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/customer/dashboard')
        }
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan. Silakan coba lagi.')
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
            Selamat Datang Kembali
          </h2>
          <p className="font-sans text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
            Silakan masuk untuk melanjutkan pemesanan batu nisan dan prasasti.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs leading-relaxed font-sans">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="email" 
              placeholder="Alamat Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
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
              className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-stone-200 focus:border-accent focus:bg-white text-stone-800 rounded-2xl text-sm font-sans transition-all duration-300 outline-none placeholder-stone-400 focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white hover:text-white font-sans text-xs tracking-widest font-semibold py-4 rounded-2xl uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-stone-500 font-sans">
          Belum punya akun? <Link href="/register" className="text-accent font-semibold hover:underline">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  )
}
