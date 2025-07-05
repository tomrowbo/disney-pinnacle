'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

export default function Navbar() {
  const [flowBalance, setFlowBalance] = useState(0.00)
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // Subscribe to Flow authentication state
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])
  
  useEffect(() => {
    // Get Flow balance when user is connected
    if (user?.addr) {
      getFlowBalance(user.addr)
    }
  }, [user?.addr])
  
  const getFlowBalance = async (address: string) => {
    try {
      const account = await fcl.account(address)
      const balance = parseFloat(account.balance) / 100000000 // Convert from smallest unit
      setFlowBalance(balance)
    } catch (error) {
      console.error('Error fetching Flow balance:', error)
    }
  }
  
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
            {user?.addr && (
              <div className="bg-gradient-to-r from-disney-gold to-amber-400 px-4 py-2 rounded-full flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
                <span className="text-white font-bold">{flowBalance.toFixed(2)} FLOW</span>
              </div>
            )}
            
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