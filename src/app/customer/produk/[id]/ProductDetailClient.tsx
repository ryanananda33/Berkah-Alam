'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, ShoppingCart, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface ProductDetailClientProps {
  product: {
    id: number
    nama: string
    harga: number
    stok: number
    deskripsi: string
    gambar: string
    kategori?: { nama: string } | null
  }
  user: any
  profile: {
    name: string
    role: string
    address?: string
  } | null
}

export default function ProductDetailClient({ product, user, profile }: ProductDetailClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [qty, setQty] = useState(1)
  const [catatanUkiran, setCatatanUkiran] = useState('')
  const [alamat, setAlamat] = useState(profile?.address || '')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (qty < 1 || qty > product.stok) {
      setErrorMsg(`Jumlah pesanan tidak valid. Stok tersedia: ${product.stok} pcs`)
      setLoading(false)
      return
    }

    if (!alamat.trim()) {
      setErrorMsg('Alamat pengiriman wajib diisi.')
      setLoading(false)
      return
    }

    try {
      const total = product.harga * qty

      // 1. Simpan ke tabel pesanan
      const { data: orderData, error: orderError } = await supabase
        .from('pesanan')
        .insert({
          user_id: user.id,
          tanggal: new Date().toISOString().split('T')[0],
          total,
          status: 'pending',
          alamat,
        })
        .select('id')
        .single()

      if (orderError) throw orderError

      const orderId = orderData.id

      // 2. Simpan ke tabel detail_pesanan
      const { error: detailError } = await supabase
        .from('detail_pesanan')
        .insert({
          pesanan_id: orderId,
          produk_id: product.id,
          qty,
          harga: product.harga,
          catatan_ukiran: catatanUkiran,
        })

      if (detailError) throw detailError

      // 3. Kurangi stok produk
      const { error: stockError } = await supabase
        .from('produk')
        .update({
          stok: product.stok - qty
        })
        .eq('id', product.id)

      if (stockError) throw stockError

      setSuccessMsg('Pesanan Anda berhasil dibuat! Mengalihkan ke pembayaran...')
      setTimeout(() => {
        router.refresh()
        router.push(`/customer/pesanan/${orderId}/pembayaran`)
      }, 1500)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(`Gagal memproses pesanan: ${err.message || 'Terjadi kesalahan'}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link 
        href="/#produk" 
        className="inline-flex items-center gap-2 border border-accent hover:bg-accent text-accent hover:text-white font-sans text-xs tracking-widest font-semibold py-2.5 px-5 rounded-full uppercase transition-all duration-300 mb-10 shadow-sm"
      >
        <ArrowLeft size={14} /> Kembali ke Produk
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="premium-card p-4 bg-white rounded-3xl h-fit">
          <img 
            src={product.gambar || 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=800&q=80'} 
            className="w-full h-auto object-cover rounded-2xl max-h-[500px]"
            alt={product.nama}
          />
        </div>

        {/* Product Info & Form */}
        <div>
          <div className="mb-6">
            <span className="inline-block font-sans text-[10px] tracking-widest bg-stone-200/60 text-stone-700 px-4 py-1.5 rounded-full uppercase font-bold mb-3">
              Kategori: {product.kategori?.nama || 'Batu Alam'}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-primary mb-3">
              {product.nama}
            </h1>
            <div className="text-accent text-2xl sm:text-3xl font-bold font-sans mb-4">
              Rp {product.harga.toLocaleString('id-ID')}
            </div>
            
            <div className="mb-6">
              {product.stok > 0 ? (
                <span className="text-emerald-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <CheckCircle size={16} /> Stok Tersedia ({product.stok} pcs)
                </span>
              ) : (
                <span className="text-red-500 text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                  <AlertCircle size={16} /> Stok Habis
                </span>
              )}
            </div>
            <hr className="border-stone-200" />
          </div>

          <div className="mb-8">
            <h5 className="font-serif text-xl font-bold text-primary mb-3">Deskripsi Produk</h5>
            <p className="text-stone-500 text-sm leading-relaxed text-justify font-light">
              {product.deskripsi || 'Produk kerajinan batu alam berkualitas premium yang dipahat oleh pengrajin berpengalaman di workshop Berkah Alam. Bahan batu tahan cuaca luar ruangan dan tulisan dilapisi cat emas yang tahan pudar.'}
            </p>
          </div>

          {/* Form */}
          {user ? (
            profile?.role === 'customer' ? (
              product.stok > 0 ? (
                <div className="premium-card p-6 rounded-2xl border-accent/30 bg-stone-50/50">
                  <h5 className="font-serif text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-accent" /> Form Kustom Pemesanan
                  </h5>

                  {errorMsg && (
                    <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-sans">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-sans">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handlePlaceOrder} className="space-y-5">
                    {/* Qty */}
                    <div>
                      <label htmlFor="qty" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                        Jumlah Pesanan (Pcs)
                      </label>
                      <input 
                        type="number" 
                        id="qty" 
                        min="1" 
                        max={product.stok}
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                        className="w-24 px-3 py-2 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
                        required
                      />
                    </div>

                    {/* Catatan Ukiran */}
                    <div>
                      <label htmlFor="catatan_ukiran" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                        Teks Ukiran Nisan / Prasasti
                      </label>
                      <textarea 
                        id="catatan_ukiran" 
                        rows={4}
                        value={catatanUkiran}
                        onChange={(e) => setCatatanUkiran(e.target.value)}
                        placeholder="Contoh untuk batu nisan:&#10;Nama: Alm. Ahmad Fauzi&#10;Lahir: Jakarta, 12 Jan 1960&#10;Wafat: Bandung, 24 Feb 2024&#10;Bin: H. Ibrahim"
                        className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)] placeholder-stone-300"
                      />
                      <span className="text-[10px] text-stone-400 block mt-1.5 leading-relaxed">
                        Tuliskan detail teks yang akan diukir di batu nisan atau prasasti dengan teliti. Tim kami akan melakukan konfirmasi ulang sebelum pemahatan dimulai.
                      </span>
                    </div>

                    {/* Alamat Pengiriman */}
                    <div>
                      <label htmlFor="alamat" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                        Alamat Pengiriman
                      </label>
                      <textarea 
                        id="alamat" 
                        rows={3}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Masukkan alamat lengkap pengiriman nisan/prasasti..."
                        className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)] placeholder-stone-300"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-widest font-semibold py-4 rounded-xl uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : 'Buat Pesanan Sekarang'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-sm font-medium">
                  Maaf, produk ini sedang tidak tersedia untuk dipesan. Silakan hubungi kami untuk informasi ketersediaan.
                </div>
              )
            ) : (
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-sm font-medium">
                Anda login sebagai Admin. Silakan gunakan akun Customer untuk memesan produk.
              </div>
            )
          ) : (
            <div className="premium-card p-6 rounded-2xl text-center">
              <p className="text-stone-500 text-sm mb-4">Silakan login atau daftar akun untuk melakukan pemesanan nisan secara kustom.</p>
              <div className="flex justify-center gap-3">
                <Link href="/login" className="bg-accent border border-accent hover:bg-transparent text-white hover:text-accent font-semibold px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all shadow-md">
                  Login
                </Link>
                <Link href="/register" className="border border-accent text-accent hover:bg-accent hover:text-white font-semibold px-6 py-2.5 rounded-full text-xs tracking-widest uppercase transition-all shadow-sm">
                  Daftar
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
