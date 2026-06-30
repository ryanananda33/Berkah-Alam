'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  User, 
  ShoppingBag, 
  Hourglass, 
  Compass, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Edit2, 
  Upload, 
  X,
  Gem,
  Loader2
} from 'lucide-react'

interface DashboardClientProps {
  orders: any[]
  stats: {
    total_orders: number
    pending: number
    processed: number
    completed: number
  }
  user: any
}

export default function DashboardClient({ orders, stats, user }: DashboardClientProps) {
  const router = useRouter()
  const supabase = createClient()

  // State untuk modal edit pesanan
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [editAlamat, setEditAlamat] = useState('')
  const [editQty, setEditQty] = useState<number>(1)
  const [editCatatan, setEditCatatan] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const openEditModal = (order: any) => {
    setEditingOrder(order)
    setEditAlamat(order.alamat || '')
    const firstDetail = order.detail_pesanan?.[0]
    if (firstDetail) {
      setEditQty(firstDetail.qty)
      setEditCatatan(firstDetail.catatan_ukiran || '')
    }
    setErrorMsg('')
    setSuccessMsg('')
  }

  const closeEditModal = () => {
    setEditingOrder(null)
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const firstDetail = editingOrder.detail_pesanan?.[0]
      if (!firstDetail) throw new Error('Detail pesanan tidak ditemukan.')

      const qtyDiff = editQty - firstDetail.qty

      // 1. Cek stok produk
      const { data: productData, error: productFetchError } = await supabase
        .from('produk')
        .select('stok, harga')
        .eq('id', firstDetail.produk_id)
        .single()

      if (productFetchError) throw productFetchError

      if (qtyDiff > 0 && productData.stok < qtyDiff) {
        throw new Error(`Stok tidak mencukupi. Sisa stok: ${productData.stok} pcs`)
      }

      // 2. Hitung total baru
      const totalDiff = productData.harga * qtyDiff
      const newTotal = editingOrder.total + totalDiff

      // 3. Update tabel pesanan (total & alamat)
      const { error: orderUpdateError } = await supabase
        .from('pesanan')
        .update({
          alamat: editAlamat,
          total: newTotal
        })
        .eq('id', editingOrder.id)

      if (orderUpdateError) throw orderUpdateError

      // 4. Update tabel detail_pesanan (qty & catatan)
      const { error: detailUpdateError } = await supabase
        .from('detail_pesanan')
        .update({
          qty: editQty,
          catatan_ukiran: editCatatan
        })
        .eq('id', firstDetail.id)

      if (detailUpdateError) throw detailUpdateError

      // 5. Update stok produk
      const { error: stockUpdateError } = await supabase
        .from('produk')
        .update({
          stok: productData.stok - qtyDiff
        })
        .eq('id', firstDetail.produk_id)

      if (stockUpdateError) throw stockUpdateError

      setSuccessMsg('Pesanan berhasil diperbarui!')
      setTimeout(() => {
        closeEditModal()
        router.refresh()
      }, 1500)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal memperbarui pesanan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-primary mb-2">
            Halo, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Pelanggan'}!
          </h1>
          <p className="text-stone-500 font-light text-sm">
            Selamat datang di dashboard pemesanan Berkah Alam. Pantau status pesanan Anda di sini.
          </p>
        </div>
        <div>
          <Link 
            href="/customer/profile" 
            className="inline-flex items-center gap-2 border border-accent hover:bg-accent text-accent hover:text-white font-sans text-xs tracking-widest font-semibold py-3 px-6 rounded-full uppercase transition-all duration-300 shadow-sm"
          >
            <User size={14} /> Edit Profil
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="premium-card p-6 rounded-2xl flex flex-col items-center text-center">
          <ShoppingBag size={28} className="text-accent mb-3" />
          <h3 className="font-sans font-bold text-2xl text-primary mb-1">{stats.total_orders}</h3>
          <p className="text-xs text-stone-400 font-sans uppercase tracking-wider">Total Pesanan</p>
        </div>
        <div className="premium-card p-6 rounded-2xl flex flex-col items-center text-center">
          <Hourglass size={28} className="text-amber-500 mb-3" />
          <h3 className="font-sans font-bold text-2xl text-primary mb-1">{stats.pending}</h3>
          <p className="text-xs text-stone-400 font-sans uppercase tracking-wider">Menunggu Pembayaran</p>
        </div>
        <div className="premium-card p-6 rounded-2xl flex flex-col items-center text-center">
          <Compass size={28} className="text-blue-500 mb-3" />
          <h3 className="font-sans font-bold text-2xl text-primary mb-1">{stats.processed}</h3>
          <p className="text-xs text-stone-400 font-sans uppercase tracking-wider">Sedang Diproses</p>
        </div>
        <div className="premium-card p-6 rounded-2xl flex flex-col items-center text-center">
          <CheckCircle2 size={28} className="text-emerald-500 mb-3" />
          <h3 className="font-sans font-bold text-2xl text-primary mb-1">{stats.completed}</h3>
          <p className="text-xs text-stone-400 font-sans uppercase tracking-wider">Selesai</p>
        </div>
      </div>

      {/* Order History Table */}
      <div className="premium-card p-6 sm:p-8 rounded-3xl">
        <h4 className="font-serif text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
          <Clock size={20} className="text-accent" /> Riwayat Pemesanan
        </h4>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={48} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 text-sm mb-6">Anda belum melakukan pemesanan produk batu alam.</p>
            <Link 
              href="/#produk" 
              className="inline-flex items-center gap-2 bg-accent border border-accent hover:bg-transparent text-white hover:text-accent font-semibold px-8 py-3 rounded-full text-xs tracking-widest uppercase transition-all shadow-md"
            >
              Lihat Koleksi Produk
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-stone-500">
              <thead className="text-xs text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th scope="col" className="px-6 py-4">ID Pesanan</th>
                  <th scope="col" className="px-6 py-4">Tanggal</th>
                  <th scope="col" className="px-6 py-4">Detail Produk</th>
                  <th scope="col" className="px-6 py-4">Total Biaya</th>
                  <th scope="col" className="px-6 py-4">Status Pesanan</th>
                  <th scope="col" className="px-6 py-4">Status Bayar</th>
                  <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => {
                  const payment = order.pembayaran?.[0];
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">#BA-{order.id}</td>
                      <td className="px-6 py-4 text-xs font-light">{order.tanggal}</td>
                      <td className="px-6 py-4">
                        {order.detail_pesanan?.map((detail: any) => (
                          <div key={detail.id} className="mb-2 last:mb-0">
                            <div className="flex items-center gap-1.5 text-stone-700">
                              <Gem size={12} className="text-accent" />
                              <span>{detail.produk?.nama} (x{detail.qty})</span>
                            </div>
                            {detail.catatan_ukiran && (
                              <div className="bg-stone-100 p-2 rounded-lg mt-1 text-[11px] leading-relaxed border-l-2 border-accent text-stone-500">
                                <strong>Ukiran:</strong> {detail.catatan_ukiran}
                              </div>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 font-bold text-accent">
                        Rp {order.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'pending' && <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase font-bold rounded-full">Pending</span>}
                        {order.status === 'diverifikasi' && <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold rounded-full">Diverifikasi</span>}
                        {order.status === 'diproses' && <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-[10px] uppercase font-bold rounded-full">Diproses</span>}
                        {order.status === 'selesai' && <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded-full">Selesai</span>}
                        {order.status === 'ditolak' && <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-[10px] uppercase font-bold rounded-full">Ditolak</span>}
                      </td>
                      <td className="px-6 py-4">
                        {payment ? (
                          payment.status === 'pending' ? (
                            <span className="text-amber-600 text-xs flex items-center gap-1"><Clock size={12} /> Menunggu Verifikasi</span>
                          ) : payment.status === 'diverifikasi' ? (
                            <span className="text-emerald-600 text-xs flex items-center gap-1"><ShieldCheck size={12} /> Pembayaran Sah</span>
                          ) : (
                            <span className="text-red-500 text-xs flex items-center gap-1"><AlertTriangle size={12} /> Ditolak</span>
                          )
                        ) : (
                          <span className="text-stone-400 text-xs flex items-center gap-1"><AlertTriangle size={12} /> Belum Bayar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          {order.status === 'pending' ? (
                            <button 
                              onClick={() => openEditModal(order)}
                              className="border border-stone-200 hover:border-accent text-stone-600 hover:text-accent font-sans text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          ) : (
                            <button className="border border-stone-100 text-stone-300 font-sans text-[11px] py-1.5 px-3 rounded-lg cursor-not-allowed" disabled>
                              Selesai
                            </button>
                          )}

                          {order.status === 'pending' && (!payment || payment.status === 'ditolak') ? (
                            <Link 
                              href={`/customer/pesanan/${order.id}/pembayaran`}
                              className="bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                            >
                              <Upload size={12} /> Bayar
                            </Link>
                          ) : (
                            <button className="border border-stone-100 text-stone-300 font-sans text-[11px] py-1.5 px-3 rounded-lg cursor-not-allowed" disabled>
                              Terbayar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl p-6 sm:p-8">
            <button 
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 focus:outline-none"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-2xl font-bold text-primary mb-6">
              Edit Pesanan #BA-{editingOrder.id}
            </h3>

            {errorMsg && (
              <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-sans">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-sans flex items-center gap-2">
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdateOrder} className="space-y-5">
              {/* Alamat Pengiriman */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                  Alamat Pengiriman
                </label>
                <textarea 
                  rows={2}
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
                  required
                />
              </div>

              {/* Detail Items */}
              <div className="space-y-4">
                <h6 className="font-sans font-bold text-xs uppercase tracking-widest text-primary">
                  Item & Teks Ukiran
                </h6>
                
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-stone-800 text-sm block">{editingOrder.detail_pesanan?.[0]?.produk?.nama}</span>
                      <span className="text-stone-400 text-xs">Harga: Rp {editingOrder.detail_pesanan?.[0]?.harga?.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <label className="block text-stone-400 text-[10px] font-semibold mb-1">JUMLAH (QTY)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={editQty}
                        onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-lg text-sm font-sans text-center outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-500 text-xs font-semibold mb-2">
                      Teks Catatan Ukiran
                    </label>
                    <textarea 
                      rows={3}
                      value={editCatatan}
                      onChange={(e) => setEditCatatan(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={closeEditModal}
                  className="flex-1 border border-stone-200 text-stone-600 font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all text-center"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
