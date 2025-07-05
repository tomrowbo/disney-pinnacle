'use client'

import Navbar from '@/components/Navbar'
import * as fcl from '@onflow/fcl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignUp() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // Subscribe to Flow authentication state
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])
  
  useEffect(() => {
    if (user?.addr) {
      router.push('/profile')
    }
  }, [user, router])
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="disney-card max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-4xl font-bold disney-title">
              Join the Magic
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Sign in to your Disney Pinnacle account
            </p>
          </div>
          
          <div className="mt-8 space-y-6">
            <button
              onClick={() => fcl.authenticate()}
              className="disney-button w-full text-center"
            >
              Connect Flow Wallet
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Secure authentication powered by Flow
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Connect your Flow wallet to start collecting Disney NFTs
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}