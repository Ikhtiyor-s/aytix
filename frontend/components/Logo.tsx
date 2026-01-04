'use client'

import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
      <img
        src="/aytixlogo.png"
        alt="AyTix Logo"
        className="h-8 w-auto sm:h-10 md:h-14 lg:h-16"
      />
    </Link>
  )
}

