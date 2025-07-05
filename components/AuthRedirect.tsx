'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthRedirect() {
  const { authenticated, ready } = usePrivy()
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    if (ready && authenticated && pathname === '/signup') {
      router.push('/profile')
    }
  }, [ready, authenticated, pathname, router])
  
  return null
}