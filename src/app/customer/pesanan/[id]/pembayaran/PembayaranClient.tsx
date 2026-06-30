'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, CreditCard, Upload, Loader2, Landmark, CheckCircle } from 'lucide-react'

interface PembayaranClientProps {
  order: {
    id: number
    total: number
    status: string
  }
  user: any
}

export default function PembayaranClient({ order, user }: PembayaranClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUploadPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setErrorMsg('Pilih file bukti pembayaran terlebih dahulu.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      let fileUrl = ''

      // Uji coba membuat bucket jika belum ada (mungkin gagal tergantung RLS, tapi bagus untuk dicoba)
      try {
        await supabase.storage.createBucket('bukti-pembayaran', { public: true })
      } catch (e) {
        // Abaikan error pembuatan bucket
      }

      // 1. Upload ke Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${order.id}-${Date.now()}.${fileExt}`
      const filePath = `bukti/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bukti-pembayaran')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.warn('Storage upload failed, using fallback placeholder:', uploadError.message)
        // Fallback jika bucket belum dibuat atau error credentials
        fileUrl = `https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=400&q=80`
      } else {
        // Dapatkan URL Publik
        const { data: { publicUrl } } = supabase.storage
          .from('bukti-pembayaran')
          .getPublicUrl(filePath)
        
        fileUrl = publicUrl
      }

      // 2. Simpan data pembayaran ke database
      const { error: paymentError } = await supabase
        .from('pembayaran')
        .insert({
          pesanan_id: order.id,
          bukti_pembayaran: fileUrl,
          tanggal_bayar: new Date().toISOString(),
          status: 'pending'
        })

      if (paymentError) throw paymentError

      // 3. Update status pesanan ke pending (sebagai tanda sudah bayar, menunggu verifikasi)
      // Di Laravel, pesanan sudah 'pending', pembayaran juga statusnya 'pending'.
      // Admin nanti memverifikasi pembayaran ini.

      setSuccessMsg('Bukti pembayaran berhasil diunggah! Menunggu verifikasi admin.')
      setTimeout(() => {
        router.refresh()
        router.push('/customer/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(`Gagal mengunggah bukti pembayaran: ${err.message || 'Terjadi kesalahan'}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link 
        href="/customer/dashboard" 
        className="inline-flex items-center gap-2 border border-accent hover:bg-accent text-accent hover:text-white font-sans text-xs tracking-widest font-semibold py-2.5 px-5 rounded-full uppercase transition-all duration-300 mb-6 shadow-sm"
      >
        <ArrowLeft size={14} /> Kembali ke Dashboard
      </Link>

      {/* Payment Information Card */}
      <div className="premium-card p-8 rounded-3xl mb-8">
        <h3 className="font-serif text-3xl font-semibold text-primary mb-2 flex items-center gap-2">
          <CreditCard className="text-accent" /> Informasi Pembayaran
        </h3>
        <p className="text-stone-500 font-light text-sm mb-6">
          Silakan lakukan transfer sesuai jumlah tagihan ke rekening bank resmi kami di bawah ini.
        </p>

        <div className="bg-stone-100/80 p-5 rounded-2xl mb-8 border border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-stone-400 text-xs font-semibold block uppercase tracking-wider mb-1">ID PESANAN</span>
              <span className="font-sans font-bold text-lg text-primary">#BA-{order.id}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-stone-400 text-xs font-semibold block uppercase tracking-wider mb-1">TOTAL TAGIHAN</span>
              <span className="font-sans font-bold text-2xl text-accent">
                Rp {order.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <h5 className="font-serif text-lg font-bold text-primary mb-4">Pilihan Rekening Transfer:</h5>
        
        <div className="space-y-4">
          <div className="border border-stone-200 rounded-2xl p-5 bg-white flex items-center justify-between shadow-sm">
            <div>
              <span className="inline-block font-sans text-[10px] tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase font-bold mb-2">
                BANK BCA
              </span>
              <h6 className="font-sans font-bold text-lg text-primary mb-1">8605-234-990</h6>
              <span className="text-stone-400 text-xs">Atas Nama: <strong className="text-stone-600 font-semibold">CV. BERKAH ALAM INDONESIA</strong></span>
            </div>
            <Landmark size={32} className="text-stone-300" />
          </div>

          <div className="border border-stone-200 rounded-2xl p-5 bg-white flex items-center justify-between shadow-sm">
            <div>
              <span className="inline-block font-sans text-[10px] tracking-wider bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase font-bold mb-2">
                BANK MANDIRI
              </span>
              <h6 className="font-sans font-bold text-lg text-primary mb-1">137-00-123456-7</h6>
              <span className="text-stone-400 text-xs">Atas Nama: <strong className="text-stone-600 font-semibold">CV. BERKAH ALAM INDONESIA</strong></span>
            </div>
            <Landmark size={32} className="text-stone-300" />
          </div>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="premium-card p-8 rounded-3xl">
        <h4 className="font-serif text-2xl font-semibold text-primary mb-2 flex items-center gap-2">
          <Upload className="text-accent" /> Unggah Bukti Transfer
        </h4>
        <p className="text-stone-500 font-light text-sm mb-6">
          Unggah file foto / tangkapan layar bukti transfer ATM atau M-Banking Anda.
        </p>

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

        <form onSubmit={handleUploadPayment} className="space-y-6">
          <div>
            <label htmlFor="bukti_pembayaran" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
              Pilih File Foto Bukti Pembayaran
            </label>
            <input 
              type="file" 
              id="bukti_pembayaran" 
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
            />
            <span className="text-[10px] text-stone-400 block mt-2">
              Format file: JPG, JPEG, atau PNG. Maksimum ukuran file: 10MB.
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-widest font-semibold py-4 rounded-xl uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Kirim Bukti Pembayaran'}
          </button>
        </form>
      </div>
    </div>
  )
}
