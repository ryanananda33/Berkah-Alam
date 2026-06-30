'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'

interface HeroClientProps {
  hero: any
}

export default function HeroClient({ hero: initialHero }: HeroClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [hero, setHero] = useState(initialHero)
  const [judul, setJudul] = useState(initialHero?.judul || '')
  const [subjudul, setSubjudul] = useState(initialHero?.subjudul || '')
  const [file, setFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleUpdateHero = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      let imageUrl = hero?.gambar || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1920&q=80'

      // 1. Upload image if selected
      if (file) {
        try {
          await supabase.storage.createBucket('hero-images', { public: true })
        } catch (e) {}

        const fileExt = file.name.split('.').pop()
        const fileName = `hero-${Date.now()}.${fileExt}`
        const filePath = `images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('hero-images')
            .getPublicUrl(filePath)
          imageUrl = publicUrl
        } else {
          console.warn('Gagal upload gambar hero ke storage:', uploadError.message)
        }
      }

      const heroPayload = {
        judul,
        subjudul,
        gambar: imageUrl,
        updated_at: new Date().toISOString()
      }

      let error = null
      let updatedData = null

      if (hero?.id) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('hero')
          .update(heroPayload)
          .eq('id', hero.id)
          .select('*')
          .single()
        
        error = updateError
        updatedData = data
      } else {
        // Create new record if somehow empty
        const { data, error: insertError } = await supabase
          .from('hero')
          .insert({
            ...heroPayload,
            created_at: new Date().toISOString()
          })
          .select('*')
          .single()
        
        error = insertError
        updatedData = data
      }

      if (error) throw error

      setHero(updatedData)
      setSuccessMsg('Banner Hero berhasil diperbarui!')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Gagal menyimpan perubahan banner hero')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-primary">Kelola Banner Hero</h2>
        <p className="text-stone-500 font-light text-sm">Sesuaikan tampilan judul, deskripsi, dan gambar latar beranda utama.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form settings */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <h5 className="font-serif text-xl font-bold text-primary mb-6">Pengaturan Banner</h5>

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

          <form onSubmit={handleUpdateHero} className="space-y-5">
            {/* Judul */}
            <div>
              <label htmlFor="judul" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                Judul Banner
              </label>
              <input 
                type="text" 
                id="judul"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: BERKAH ALAM"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)] font-semibold"
                required
              />
            </div>

            {/* Subjudul */}
            <div>
              <label htmlFor="subjudul" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                Deskripsi / Subjudul
              </label>
              <textarea 
                id="subjudul"
                rows={3}
                value={subjudul}
                onChange={(e) => setSubjudul(e.target.value)}
                placeholder="Deskripsi singkat yang menjelaskan keunggulan workshop..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-accent text-stone-800 rounded-xl text-sm font-sans outline-none focus:shadow-[0_0_10px_rgba(197,168,128,0.15)] font-light"
                required
              />
            </div>

            {/* Upload Background */}
            <div>
              <label htmlFor="hero_bg" className="block text-stone-500 font-sans text-xs font-semibold mb-2">
                Gambar Latar
              </label>
              <input 
                type="file" 
                id="hero_bg"
                accept="image/*"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-stone-800 rounded-xl text-sm font-sans outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent"
              />
              <span className="text-[10px] text-stone-400 block mt-2">
                Unggah gambar baru untuk mengganti gambar latar beranda utama.
              </span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex items-center justify-center bg-accent border border-accent hover:bg-accent/90 text-white font-sans text-xs tracking-widest font-semibold py-4 px-8 rounded-xl uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* Banner Preview Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
          <h5 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <ImageIcon size={20} className="text-accent" /> Tinjauan Tampilan (Preview)
          </h5>

          <div 
            className="relative h-64 rounded-2xl bg-cover bg-center flex items-center justify-center p-4 text-center overflow-hidden border border-stone-100 shadow-inner"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('${hero?.gambar || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80'}')`
            }}
          >
            <div>
              <h4 className="font-serif font-semibold text-white text-xl sm:text-2xl mb-2 drop-shadow-md">
                {judul || 'BERKAH ALAM'}
              </h4>
              <p className="font-sans text-white/80 text-[10px] sm:text-xs max-w-xs mx-auto leading-normal font-light">
                {subjudul || 'Menghadirkan nisan premium...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
