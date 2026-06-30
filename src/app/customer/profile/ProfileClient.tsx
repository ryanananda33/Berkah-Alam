'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, User, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react'

interface ProfileClientProps {
  user: any
  profile: {
    name: string
    phone: string
    address: string
  } | null
}

export default function ProfileClient({ user, profile }: ProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [address, setAddress] = useState(profile?.address || '')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Update public.users table
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name,
          phone,
          address,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 2. Update Supabase Auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name,
          phone,
          address
        }
      })

      if (authError) throw authError

      setSuccessMsg('Profil Anda berhasil diperbarui!')
      setTimeout(() => {
        router.refresh()
        router.push('/customer/dashboard')
      }, 1500)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Terjadi kesalahan saat memperbarui profil.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link 
        href="/customer/dashboard" 
        className="inline-flex items-center gap-2 border border-accent hover:bg-accent text-accent hover:text-white font-sans text-xs tracking-widest font-semibold py-2.5 px-5 rounded-full uppercase transition-all duration-300 mb-8 shadow-sm"
      >
        <ArrowLeft size={14} /> Kembali ke Dashboard
      </Link>

      <div className="premium-card p-8 rounded-3xl">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-semibold text-primary mb-2">
            Ubah Profil
          </h2>
          <p className="text-stone-500 font-light text-sm">
            Perbarui data diri Anda untuk memudahkan koordinasi pengiriman pesanan Anda.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-sans">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-sans flex items-center gap-2">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-stone-400 font-sans text-xs font-semibold mb-2">
              Alamat Email (Tidak dapat diubah)
            </label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled 
              className="w-full px-4 py-3 bg-stone-100 border border-stone-200 text-stone-400 rounded-xl text-sm font-sans outline-none cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
              Nomor Telepon (WhatsApp)
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nomor Telepon"
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
              Alamat Lengkap
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-4 text-stone-400" />
              <textarea 
                rows={3}
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat Lengkap"
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-widest font-semibold py-4 rounded-xl uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  )
}
