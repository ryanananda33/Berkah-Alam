'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Gem, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  X, 
  Trash2, 
  Edit2, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  Landmark,
  ExternalLink,
  Printer,
  AlertTriangle
} from 'lucide-react'

interface PesananClientProps {
  orders: any[]
}

export default function PesananClient({ orders: initialOrders }: PesananClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Edit Order Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [editAlamat, setEditAlamat] = useState('')
  const [editTotal, setEditTotal] = useState(0)
  const [editQty, setEditQty] = useState(1)
  const [editCatatan, setEditCatatan] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Pre-select order if query parameter 'id' is passed
  useEffect(() => {
    const orderIdQuery = searchParams.get('id')
    if (orderIdQuery && orders.length > 0) {
      const order = orders.find(o => o.id === parseInt(orderIdQuery))
      if (order) {
        setSelectedOrder(order)
      }
    } else if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0])
    }
  }, [searchParams, orders, selectedOrder])

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      order.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Set order details for edit
  const openEditModal = (order: any) => {
    setEditAlamat(order.alamat || '')
    setEditTotal(order.total)
    const detail = order.detail_pesanan?.[0]
    if (detail) {
      setEditQty(detail.qty)
      setEditCatatan(detail.catatan_ukiran || '')
    }
    setErrorMsg('')
    setSuccessMsg('')
    setShowEditModal(true)
  }

  // Update order status directly
  const handleUpdateStatus = async (status: string) => {
    if (!selectedOrder) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('pesanan')
        .update({ status })
        .eq('id', selectedOrder.id)

      if (error) throw error

      const updated = { ...selectedOrder, status }
      setOrders(orders.map(o => o.id === selectedOrder.id ? updated : o))
      setSelectedOrder(updated)
      setSuccessMsg('Status pesanan berhasil diperbarui!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal mengubah status pesanan')
    } finally {
      setLoading(false)
    }
  }

  // Verify/Reject Payment
  const handleVerifyPayment = async (action: 'verify' | 'reject') => {
    if (!selectedOrder || !selectedOrder.pembayaran?.[0]) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const payStatus = action === 'verify' ? 'diverifikasi' : 'ditolak'
    const orderStatus = action === 'verify' ? 'diverifikasi' : 'pending' // if payment rejected, goes back to pending

    try {
      // 1. Update status pembayaran
      const { error: payError } = await supabase
        .from('pembayaran')
        .update({ status: payStatus })
        .eq('id', selectedOrder.pembayaran[0].id)

      if (payError) throw payError

      // 2. Update status pesanan
      const { error: orderError } = await supabase
        .from('pesanan')
        .update({ status: orderStatus })
        .eq('id', selectedOrder.id)

      if (orderError) throw orderError

      const updated = { 
        ...selectedOrder, 
        status: orderStatus,
        pembayaran: [{ ...selectedOrder.pembayaran[0], status: payStatus }]
      }
      
      setOrders(orders.map(o => o.id === selectedOrder.id ? updated : o))
      setSelectedOrder(updated)
      setSuccessMsg(action === 'verify' ? 'Pembayaran berhasil disetujui!' : 'Pembayaran ditolak.')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal memverifikasi pembayaran')
    } finally {
      setLoading(false)
    }
  }

  // Delete Order
  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini secara permanen?')) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('pesanan')
        .delete()
        .eq('id', orderId)

      if (error) throw error

      const remaining = orders.filter(o => o.id !== orderId)
      setOrders(remaining)
      setSelectedOrder(remaining[0] || null)
      setSuccessMsg('Pesanan berhasil dihapus!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menghapus pesanan')
    } finally {
      setLoading(false)
    }
  }

  // Save changes from Edit Modal
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const detail = selectedOrder.detail_pesanan?.[0]
      if (!detail) throw new Error('Detail pesanan tidak ditemukan.')

      // 1. Update pesanan (total & alamat)
      const { error: orderError } = await supabase
        .from('pesanan')
        .update({
          alamat: editAlamat,
          total: editTotal
        })
        .eq('id', selectedOrder.id)

      if (orderError) throw orderError

      // 2. Update detail_pesanan (qty & catatan)
      const { error: detailError } = await supabase
        .from('detail_pesanan')
        .update({
          qty: editQty,
          catatan_ukiran: editCatatan
        })
        .eq('id', detail.id)

      if (detailError) throw detailError

      const updated = {
        ...selectedOrder,
        alamat: editAlamat,
        total: editTotal,
        detail_pesanan: [{
          ...detail,
          qty: editQty,
          catatan_ukiran: editCatatan
        }]
      }

      setOrders(orders.map(o => o.id === selectedOrder.id ? updated : o))
      setSelectedOrder(updated)
      setSuccessMsg('Perubahan pesanan berhasil disimpan!')
      setTimeout(() => {
        setShowEditModal(false)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menyimpan perubahan')
    } finally {
      setLoading(false)
    }
  }

  // Print Invoice Action
  const handlePrintInvoice = () => {
    window.print()
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary">Kelola Pesanan</h2>
        <p className="text-stone-500 font-light text-sm">Verifikasi pembayaran, ubah status pengerjaan, dan cetak invoice pelanggan.</p>
      </div>

      {successMsg && !showEditModal && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-sans flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && !showEditModal && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-sans">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        {/* Orders Master List (Left Pane) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text" 
                placeholder="Cari ID Pesanan / Pelanggan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${statusFilter === 'all' ? 'bg-accent text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatusFilter('diverifikasi')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${statusFilter === 'diverifikasi' ? 'bg-blue-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Diverifikasi
              </button>
              <button 
                onClick={() => setStatusFilter('diproses')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${statusFilter === 'diproses' ? 'bg-purple-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Diproses
              </button>
              <button 
                onClick={() => setStatusFilter('selesai')}
                className={`px-3 py-1.5 rounded-full font-semibold transition-all ${statusFilter === 'selesai' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 font-light text-sm">
                Tidak ada pesanan yang sesuai filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id
                const payment = order.pembayaran?.[0]
                return (
                  <div 
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order)
                      setErrorMsg('')
                      setSuccessMsg('')
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' 
                        : 'bg-white text-stone-600 border-stone-200 hover:border-accent hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-sans font-bold text-sm block">#BA-{order.id}</span>
                        <span className={`text-[10px] uppercase font-bold font-sans tracking-wide block ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                          {order.users?.name || 'Pelanggan'}
                        </span>
                      </div>
                      <div>
                        {order.status === 'pending' && <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] uppercase font-bold rounded-full">Pending</span>}
                        {order.status === 'diverifikasi' && <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] uppercase font-bold rounded-full">Diverifikasi</span>}
                        {order.status === 'diproses' && <span className="px-2 py-0.5 bg-purple-500 text-white text-[9px] uppercase font-bold rounded-full">Diproses</span>}
                        {order.status === 'selesai' && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] uppercase font-bold rounded-full">Selesai</span>}
                        {order.status === 'ditolak' && <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] uppercase font-bold rounded-full">Ditolak</span>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs border-t border-white/10 pt-3 mt-3">
                      <span className={`font-bold font-sans ${isSelected ? 'text-accent' : 'text-accent'}`}>
                        Rp {order.total.toLocaleString('id-ID')}
                      </span>
                      {payment ? (
                        payment.status === 'pending' ? (
                          <span className="text-amber-500 text-[10px] font-semibold">Bukti Masuk</span>
                        ) : payment.status === 'diverifikasi' ? (
                          <span className="text-emerald-500 text-[10px] font-semibold">Sah</span>
                        ) : (
                          <span className="text-red-500 text-[10px] font-semibold">Ditolak</span>
                        )
                      ) : (
                        <span className="text-stone-400 text-[10px]">Belum Bayar</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Order Details Pane (Right Pane / Detail Pane) */}
        <div className="lg:col-span-7 print:block print:w-full">
          {selectedOrder ? (
            <div className="space-y-6 print:space-y-4">
              
              {/* Actions Header (Print only hidden) */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-5 shadow-sm print:hidden">
                <span className="text-sm font-sans font-semibold text-primary">Aksi Cepat</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => openEditModal(selectedOrder)}
                    className="border border-stone-200 hover:border-accent text-stone-600 hover:text-accent font-sans text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Edit2 size={14} /> Edit Pesanan
                  </button>
                  <button 
                    onClick={handlePrintInvoice}
                    className="border border-stone-200 hover:border-accent text-stone-600 hover:text-accent font-sans text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Printer size={14} /> Cetak Invoice
                  </button>
                  <button 
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="border border-red-200 hover:bg-red-500 text-red-600 hover:text-white font-sans text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>

              {/* Printable Invoice Page */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
                
                {/* Print Header (Only visible during print) */}
                <div className="hidden print:flex justify-between items-center border-b-2 border-stone-300 pb-6 mb-6">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-primary">Berkah Alam Memorial</h1>
                    <p className="text-xs text-stone-500 mt-1">Nisan & Prasasti Batu Alam Premium</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-sans font-bold text-xl text-primary">INVOICE</h3>
                    <p className="text-xs text-stone-400 mt-1">#BA-{selectedOrder.id}</p>
                  </div>
                </div>

                <h5 className="font-serif text-xl font-bold text-primary mb-4 print:hidden flex items-center gap-2">
                  <FileText size={20} className="text-accent" /> Detail Transaksi #BA-{selectedOrder.id}
                </h5>

                {/* Ordered Items */}
                <div className="space-y-4 mb-6">
                  {selectedOrder.detail_pesanan?.map((detail: any) => (
                    <div key={detail.id} className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-stone-100 pb-4 mb-4">
                      <div className="flex-grow space-y-1">
                        <h6 className="font-serif text-lg font-bold text-primary">{detail.produk?.nama}</h6>
                        <span className="text-stone-400 text-xs block">
                          Harga Satuan: Rp {detail.harga.toLocaleString('id-ID')} | Jumlah: {detail.qty} Pcs
                        </span>
                        {detail.catatan_ukiran && (
                          <div className="bg-stone-50 p-4 rounded-xl mt-3 text-xs border-l-3 border-accent text-stone-600 font-sans leading-relaxed">
                            <strong className="block mb-1 text-primary">Catatan Ukiran:</strong>
                            <pre className="whitespace-pre-wrap font-sans">{detail.catatan_ukiran}</pre>
                          </div>
                        )}
                      </div>
                      <div className="text-right mt-3 sm:mt-0">
                        <span className="font-sans font-bold text-lg text-primary">
                          Rp {(detail.harga * detail.qty).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-stone-500">Total Tagihan:</span>
                    <span className="font-sans font-bold text-2xl text-accent">
                      Rp {selectedOrder.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Info Customer & Delivery Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-stone-200 text-sm">
                  <div>
                    <h6 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-400 mb-3">
                      Informasi Pelanggan
                    </h6>
                    <ul className="space-y-2 text-stone-600">
                      <li className="flex items-center gap-2">
                        <User size={14} className="text-stone-400" /> {selectedOrder.users?.name}
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail size={14} className="text-stone-400" /> {selectedOrder.users?.email}
                      </li>
                      {selectedOrder.users?.phone && (
                        <li className="flex items-center gap-2 print:flex">
                          <Phone size={14} className="text-stone-400" /> 
                          <a 
                            href={`https://wa.me/${selectedOrder.users.phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            className="text-stone-600 hover:text-accent flex items-center gap-0.5 print:no-underline print:text-stone-600"
                          >
                            {selectedOrder.users.phone} <ExternalLink size={10} className="text-stone-400 print:hidden" />
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-400 mb-3">
                      Alamat Pengiriman
                    </h6>
                    <div className="flex gap-2 text-stone-600 leading-relaxed">
                      <MapPin size={14} className="text-stone-400 shrink-0 mt-1" />
                      <span>{selectedOrder.alamat || selectedOrder.users?.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Print Footer */}
                <div className="hidden print:block border-t-2 border-stone-200 mt-10 pt-6 text-center text-xs text-stone-400">
                  <p>Terima kasih atas kepercayaan Anda memesan nisan di Berkah Alam Memorial.</p>
                  <p className="mt-1">CV. BERKAH ALAM INDONESIA | Kuningan, Jawa Barat</p>
                </div>
              </div>

              {/* Payment Proof & Verification (Print hidden) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
                {/* Proof of Payment */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                  <h5 className="font-serif text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Landmark size={18} className="text-accent" /> Bukti Pembayaran
                  </h5>

                  {selectedOrder.pembayaran?.[0] ? (
                    <div className="space-y-4">
                      <div className="text-xs">
                        <span className="text-stone-400 block mb-0.5">Tanggal Bayar:</span>
                        <span className="font-medium text-stone-700">
                          {new Date(selectedOrder.pembayaran[0].tanggal_bayar).toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-stone-400 text-xs block mb-2">Slip Transfer:</span>
                        <a 
                          href={selectedOrder.pembayaran[0].bukti_pembayaran} 
                          target="_blank" 
                          rel="noreferrer"
                          className="relative block h-40 w-full border border-stone-200 rounded-xl overflow-hidden group"
                        >
                          <img 
                            src={selectedOrder.pembayaran[0].bukti_pembayaran} 
                            alt="Slip Transfer" 
                            className="w-full h-full object-contain bg-stone-50"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-all">
                            Buka Gambar di Tab Baru
                          </div>
                        </a>
                      </div>

                      {selectedOrder.pembayaran[0].status === 'pending' ? (
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => handleVerifyPayment('verify')}
                            disabled={loading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                          >
                            <Check size={14} /> Setujui
                          </button>
                          <button 
                            onClick={() => handleVerifyPayment('reject')}
                            disabled={loading}
                            className="flex-1 border border-red-200 hover:bg-red-500 text-red-600 hover:text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                          >
                            <X size={14} /> Tolak
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-150 text-center text-xs">
                          {selectedOrder.pembayaran[0].status === 'diverifikasi' ? (
                            <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 size={14} /> Pembayaran Diverifikasi (Sah)
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold flex items-center justify-center gap-1">
                              <X size={14} /> Pembayaran Ditolak
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center text-amber-800 text-xs">
                      <AlertTriangle className="mx-auto text-amber-500 mb-2" size={24} />
                      Belum ada pembayaran masuk dari customer.
                    </div>
                  )}
                </div>

                {/* Manage Order Status */}
                <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
                  <h5 className="font-serif text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-accent" /> Status Pengerjaan
                  </h5>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                        Status Pesanan Saat Ini
                      </label>
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none disabled:opacity-50"
                      >
                        <option value="pending">Pending (Belum Bayar / Menunggu Slip)</option>
                        <option value="diverifikasi">Diverifikasi (Pembayaran Sah)</option>
                        <option value="diproses">Diproses (Pemahatan)</option>
                        <option value="selesai">Selesai (Kirim / Diambil)</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-500 text-xs leading-relaxed space-y-1">
                      <p className="font-semibold text-stone-700">Petunjuk Alur:</p>
                      <p>1. Pesanan baru statusnya **Pending**.</p>
                      <p>2. Setujui bukti transfer mengubah status ke **Diverifikasi**.</p>
                      <p>3. Ubah ke **Diproses** saat tim mulai memahat batu.</p>
                      <p>4. Ubah ke **Selesai** setelah barang dikirim atau diambil.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-stone-400 font-light text-sm h-64 flex items-center justify-center">
              Pilih pesanan di sebelah kiri untuk melihat detail.
            </div>
          )}
        </div>
      </div>

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl p-6 sm:p-8">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 focus:outline-none"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-2xl font-bold text-primary mb-6">
              Edit Pesanan #BA-{selectedOrder.id}
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

            <form onSubmit={handleSaveChanges} className="space-y-5">
              {/* Alamat Pengiriman */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                  Alamat Pengiriman
                </label>
                <textarea 
                  rows={2}
                  value={editAlamat}
                  onChange={(e) => setEditAlamat(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                  required
                />
              </div>

              {/* Total Tagihan */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                  Total Tagihan (Rp)
                </label>
                <input 
                  type="number"
                  value={editTotal}
                  onChange={(e) => setEditTotal(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
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
                      <span className="font-semibold text-stone-800 text-sm block">
                        {selectedOrder.detail_pesanan?.[0]?.produk?.nama}
                      </span>
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
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-stone-200 text-stone-600 font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all text-center"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
