import React from 'react'
import Link from 'next/link'
import { Phone, MapPin, Clock, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-stone-100/75 backdrop-blur-md text-stone-600 py-20 mt-auto border-t border-white/50 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Slogan */}
          <div>
            <h5 className="font-serif text-2xl text-primary tracking-wide mb-5">
              Berkah Alam <span className="font-serif italic text-accent font-medium">Memorial</span>
            </h5>
            <p className="text-stone-400 font-sans leading-relaxed max-w-sm">
              Mewujudkan penghormatan terindah untuk orang-orang yang Anda cintai, dengan keahlian dan dedikasi penuh.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h6 className="font-sans font-bold text-xs uppercase tracking-widest text-primary mb-6">
              Informasi Kontak
            </h6>
            <ul className="space-y-4 font-sans text-stone-500">
              <li className="flex items-start">
                <MapPin size={18} className="mr-3 text-accent shrink-0 mt-0.5" />
                <span>Jl. Raya Desa Nanggerang, Kec. Jalaksana, Kabupaten Kuningan, Jawa Barat 45556</span>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="mr-3 text-accent shrink-0" />
                <span>Hari Kerja 08.00-17.00 | Akhir Pekan 09.00-15.00</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-accent shrink-0" />
                <span>0814-6892-0234</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-accent shrink-0" />
                <span>berkahalam@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media Link */}
          <div>
            <h6 className="font-sans font-bold text-xs uppercase tracking-widest text-primary mb-6">
              Ikuti Kami
            </h6>
            <div className="flex space-x-3">
              <a href="#" className="flex items-center justify-center w-10 h-10 border border-stone-200 text-stone-500 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all" aria-label="Instagram">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="https://wa.me/6281461143708" className="flex items-center justify-center w-10 h-10 border border-stone-200 text-stone-500 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all" aria-label="WhatsApp">
                <Phone size={18} />
              </a>
              <a href="#" className="flex items-center justify-center w-10 h-10 border border-stone-200 text-stone-500 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all" aria-label="Facebook">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-stone-200 my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-stone-400">
          <p>&copy; {new Date().getFullYear()} Berkah Alam Memorial. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-medium">Crafted with care & precision.</p>
        </div>
      </div>
    </footer>
  )
}
