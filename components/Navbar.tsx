'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // Subscribe to Flow authentication state
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])

  
  const login = () => fcl.authenticate()
  const logout = () => fcl.unauthenticate()
  
  return (
    <nav className="bg-disney-darker/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/pinnacle-logo.png" alt="Disney Pinnacle" className="h-8 w-auto" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-disney-light-blue transition-colors">
              Home
            </Link>
            <Link href="/marketplace" className="text-gray-300 hover:text-disney-light-blue transition-colors">
              Marketplace
            </Link>
            <Link href="/collections" className="text-gray-300 hover:text-disney-light-blue transition-colors">
              Collections
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-disney-light-blue transition-colors">
              Profile
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">     
            {!user?.addr ? (
              <button onClick={login} className="disney-button">
                Connect Flow Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-gray-300 hover:text-disney-light-blue transition-colors">
                  {user.addr.slice(0, 6)}...{user.addr.slice(-4)}
                </Link>
                <button onClick={logout} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}