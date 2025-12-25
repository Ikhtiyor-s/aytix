'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 h-[100px] flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/aytix_logo.png"
              alt="AyTix Logo"
              className="h-10 w-auto md:h-[72px] brightness-0 invert"
            />
            <p className="text-sm">© 2024 AyTix. Barcha huquqlar himoyalangan.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/marketplace" className="hover:text-indigo-400 transition-colors">
              Bosh sahifa
            </Link>
            <a href="https://t.me/Ikhtiyor_sb" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
              Adminga murojaat
            </a>
            <Link href="/contact" className="hover:text-indigo-400 transition-colors">
              Aloqa
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

