'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export default function Navbar() {
  const [dapperBalance] = useState(0.00)
  const { ready, authenticated, user, login, logout } = usePrivy()
  
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
            {authenticated && (
              <div className="bg-gradient-to-r from-disney-gold to-amber-400 px-4 py-2 rounded-full flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                <span className="text-white font-bold">${dapperBalance.toFixed(2)}</span>
              </div>
            )}
            
            {ready && !authenticated ? (
              <button onClick={login} className="disney-button">
                Sign In
              </button>
            ) : authenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-gray-300 hover:text-disney-light-blue transition-colors">
                  Profile
                </Link>
                <button onClick={logout} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}