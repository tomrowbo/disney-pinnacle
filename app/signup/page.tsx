'use client'

import Navbar from '@/components/Navbar'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignUp() {
  const router = useRouter()
  const { ready, authenticated, login } = usePrivy()
  
  useEffect(() => {
    if (authenticated) {
      router.push('/profile')
    }
  }, [authenticated, router])
  
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
              onClick={login}
              disabled={!ready}
              className="disney-button w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ready ? 'Sign In with Privy' : 'Loading...'}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Secure authentication powered by Privy
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports email, Google, and wallet connections
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}