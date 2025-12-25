'use client'

import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/marketplace" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
      <img
        src="/aytix_logo.png"
        alt="AyTix Logo"
        className="h-16 w-auto md:h-20"
      />
    </Link>
  )
}

