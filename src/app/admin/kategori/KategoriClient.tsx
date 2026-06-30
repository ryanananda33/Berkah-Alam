'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { FolderHeart, Plus, Edit2, Trash2, Loader2, CheckCircle2, X } from 'lucide-react'

interface KategoriClientProps {
  categories: any[]
}

export default function KategoriClient({ categories: initialCategories }: KategoriClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [categories, setCategories] = useState(initialCategories)
  const [newCatName, setNewCatName] = useState('')
  const [editingCat, setEditingCat] = useState<any | null>(null)
  const [editingCatName, setEditingCatName] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data, error } = await supabase
        .from('kategori')
        .insert({ nama: newCatName })
        .select('*')
        .single()

      if (error) throw error

      setCategories([...categories, data])
      setNewCatName('')
      setSuccessMsg('Kategori berhasil ditambahkan!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menambahkan kategori')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (cat: any) => {
    setEditingCat(cat)
    setEditingCatName(cat.nama)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCat || !editingCatName.trim()) return

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data, error } = await supabase
        .from('kategori')
        .update({ nama: editingCatName })
        .eq('id', editingCat.id)
        .select('*')
        .single()

      if (error) throw error

      setCategories(categories.map((c) => (c.id === data.id ? data : c)))
      setEditingCat(null)
      setSuccessMsg('Kategori berhasil diperbarui!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal memperbarui kategori')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua produk dalam kategori ini juga akan terhapus.')) {
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('kategori')
        .delete()
        .eq('id', id)

      if (error) throw error

      setCategories(categories.filter((c) => c.id !== id))
      setSuccessMsg('Kategori berhasil dihapus!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menghapus kategori')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary">Kelola Kategori</h2>
        <p className="text-stone-500 font-light text-sm">Tambahkan, ubah, atau hapus kategori kerajinan batu alam.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Add / Edit */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm h-fit">
          <h5 className="font-serif text-xl font-bold text-primary mb-6">
            {editingCat ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
          </h5>

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

          <form onSubmit={editingCat ? handleUpdateCategory : handleAddCategory} className="space-y-5">
            <div>
              <label htmlFor="cat_name" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                Nama Kategori
              </label>
              <input 
                type="text" 
                id="cat_name"
                value={editingCat ? editingCatName : newCatName}
                onChange={(e) => editingCat ? setEditingCatName(e.target.value) : setNewCatName(e.target.value)}
                placeholder="Contoh: Batu Nisan"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)]"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingCat && (
                <button 
                  type="button" 
                  onClick={() => setEditingCat(null)}
                  className="flex-1 border border-stone-200 text-stone-600 font-sans text-xs tracking-wider font-semibold py-3.5 rounded-xl uppercase transition-all text-center"
                >
                  Batal
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-widest font-semibold py-3.5 rounded-xl uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (editingCat ? 'Simpan' : 'Tambah')}
              </button>
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm lg:col-span-2">
          <h5 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <FolderHeart size={20} className="text-accent" /> Daftar Kategori
          </h5>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-stone-400 font-light text-sm">
              Belum ada kategori yang ditambahkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-stone-500">
                <thead className="text-xs text-stone-400 uppercase tracking-wider border-b border-stone-100">
                  <tr>
                    <th scope="col" className="pb-3 px-4">Nama Kategori</th>
                    <th scope="col" className="pb-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-primary">{cat.nama}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => handleEditCategory(cat)}
                            className="border border-stone-200 hover:border-accent text-stone-600 hover:text-accent font-sans text-[11px] font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
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
      </div>
    </div>
  )
}
