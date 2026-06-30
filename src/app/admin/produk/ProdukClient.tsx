'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Gem, Plus, Edit2, Trash2, Loader2, CheckCircle2, X, Image as ImageIcon } from 'lucide-react'

interface ProdukClientProps {
  products: any[]
  categories: any[]
}

export default function ProdukClient({ products: initialProducts, categories }: ProdukClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [products, setProducts] = useState(initialProducts)
  
  // States untuk modal/form Add/Edit
  const [showForm, setShowForm] = useState(false)
  const [editingProd, setEditingProd] = useState<any | null>(null)
  
  const [nama, setNama] = useState('')
  const [kategoriId, setKategoriId] = useState('')
  const [harga, setHarga] = useState('')
  const [stok, setStok] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const openAddForm = () => {
    setEditingProd(null)
    setNama('')
    setKategoriId(categories[0]?.id?.toString() || '')
    setHarga('')
    setStok('')
    setDeskripsi('')
    setFile(null)
    setErrorMsg('')
    setSuccessMsg('')
    setShowForm(true)
  }

  const openEditForm = (prod: any) => {
    setEditingProd(prod)
    setNama(prod.nama)
    setKategoriId(prod.kategori_id.toString())
    setHarga(prod.harga.toString())
    setStok(prod.stok.toString())
    setDeskripsi(prod.deskripsi || '')
    setFile(null)
    setErrorMsg('')
    setSuccessMsg('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProd(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      let imageUrl = editingProd?.gambar || 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=400&q=80'

      // 1. Upload image if selected
      if (file) {
        try {
          await supabase.storage.createBucket('produk-images', { public: true })
        } catch (e) {}

        const fileExt = file.name.split('.').pop()
        const fileName = `prod-${Date.now()}.${fileExt}`
        const filePath = `images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('produk-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('produk-images')
            .getPublicUrl(filePath)
          imageUrl = publicUrl
        } else {
          console.warn('Gagal upload gambar produk ke storage:', uploadError.message)
        }
      }

      const productPayload = {
        nama,
        kategori_id: parseInt(kategoriId),
        harga: parseFloat(harga),
        stok: parseInt(stok),
        deskripsi,
        gambar: imageUrl,
        updated_at: new Date().toISOString()
      }

      if (editingProd) {
        // Edit produk
        const { data, error } = await supabase
          .from('produk')
          .update(productPayload)
          .eq('id', editingProd.id)
          .select('*, kategori:kategori_id(id, nama)')
          .single()

        if (error) throw error

        setProducts(products.map((p) => (p.id === data.id ? data : p)))
        setSuccessMsg('Produk berhasil diperbarui!')
      } else {
        // Tambah produk baru
        const { data, error } = await supabase
          .from('produk')
          .insert({
            ...productPayload,
            created_at: new Date().toISOString()
          })
          .select('*, kategori:kategori_id(id, nama)')
          .single()

        if (error) throw error

        setProducts([...products, data])
        setSuccessMsg('Produk baru berhasil ditambahkan!')
      }

      setTimeout(() => {
        closeForm()
        router.refresh()
      }, 1500)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menyimpan produk')
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('produk')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(products.filter((p) => p.id !== id))
      setSuccessMsg('Produk berhasil dihapus!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menghapus produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary">Kelola Produk</h2>
          <p className="text-stone-500 font-light text-sm">Tambahkan nisan, prasasti, atau ukiran kustom ke katalog web.</p>
        </div>
        <div>
          <button 
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-accent border border-accent hover:bg-transparent text-white hover:text-accent font-semibold px-6 py-3 rounded-full text-xs tracking-widest uppercase transition-all shadow-md"
          >
            <Plus size={14} /> Tambah Produk
          </button>
        </div>
      </div>

      {successMsg && !showForm && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-sans flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && !showForm && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-sans">
          {errorMsg}
        </div>
      )}

      {/* Products List Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h5 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
          <Gem size={20} className="text-accent" /> Katalog Produk
        </h5>

        {products.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-light text-sm">
            Belum ada produk yang ditambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-stone-500">
              <thead className="text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                <tr>
                  <th scope="col" className="pb-3 px-4">Gambar</th>
                  <th scope="col" className="pb-3 px-4">Nama Produk</th>
                  <th scope="col" className="pb-3 px-4">Kategori</th>
                  <th scope="col" className="pb-3 px-4">Harga</th>
                  <th scope="col" className="pb-3 px-4">Stok</th>
                  <th scope="col" className="pb-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <img 
                        src={prod.gambar || 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=80&q=80'} 
                        alt={prod.nama} 
                        className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                      />
                    </td>
                    <td className="py-4 px-4 font-semibold text-primary">{prod.nama}</td>
                    <td className="py-4 px-4 text-stone-600">{prod.kategori?.nama || 'Batu Alam'}</td>
                    <td className="py-4 px-4 font-bold text-accent">Rp {prod.harga.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-4">
                      {prod.stok > 0 ? (
                        <span className="font-semibold text-emerald-600">{prod.stok} pcs</span>
                      ) : (
                        <span className="font-semibold text-red-500">Habis</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => openEditForm(prod)}
                          className="border border-stone-200 hover:border-accent text-stone-600 hover:text-accent font-sans text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="border border-stone-200 hover:border-red-500 text-stone-600 hover:text-red-500 font-sans text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-stone-200 shadow-2xl rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <button 
              onClick={closeForm}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 focus:outline-none"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-2xl font-bold text-primary mb-6">
              {editingProd ? `Edit Produk: ${editingProd.nama}` : 'Tambah Produk Baru'}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">Nama Produk</label>
                <input 
                  type="text" 
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Nisan Granit Hitam Book"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">Kategori</label>
                <select 
                  value={kategoriId}
                  onChange={(e) => setKategoriId(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nama}</option>
                  ))}
                </select>
              </div>

              {/* Harga & Stok */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="Contoh: 2500000"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">Jumlah Stok</label>
                  <input 
                    type="number" 
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="Contoh: 10"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                    required
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">Deskripsi Produk</label>
                <textarea 
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Detail ukuran, bahan, dan kelebihan nisan..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none"
                />
              </div>

              {/* Gambar */}
              <div>
                <label className="block text-stone-500 font-sans text-xs font-semibold mb-2">Gambar Produk</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-sm font-sans outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent"
                  />
                </div>
                {editingProd && !file && (
                  <span className="text-[10px] text-stone-400 block mt-1.5">
                    Kosongkan jika tidak ingin mengubah gambar.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button" 
                  onClick={closeForm}
                  className="flex-1 border border-stone-200 text-stone-600 font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all text-center"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
