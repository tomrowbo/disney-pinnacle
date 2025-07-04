'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import AddToWalletButton from '@/components/AddToWalletButton'

export default function Profile() {
  const router = useRouter()
  const { ready, authenticated, user: privyUser, logout } = usePrivy()
  const [userStats] = useState({
    pinsCollected: 42,
    joinDate: 'July 2025'
  })
  
  const getUsername = (email: string) => {
    const username = email.split('@')[0]
    return `@${username}`
  }
  
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/signup')
    }
  }, [ready, authenticated, router])
  
  const handleSignOut = () => {
    logout()
    router.push('/')
  }
  
  if (!ready || !authenticated) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="disney-card">
            <p className="text-white">Loading...</p>
          </div>
        </main>
      </>
    )
  }
  
  const myPins = [
    { id: 1, name: 'Castle Pin', rarity: 'Legendary', emoji: '🏰' },
    { id: 2, name: 'Space Mountain', rarity: 'Epic', emoji: '🚀' },
    { id: 3, name: 'Tinkerbell', rarity: 'Rare', emoji: '🧚' },
    { id: 4, name: 'Mickey Ears', rarity: 'Common', emoji: '👂' },
    { id: 5, name: 'Genie Lamp', rarity: 'Epic', emoji: '🪔' },
    { id: 6, name: 'Glass Slipper', rarity: 'Legendary', emoji: '👠' },
  ]
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="disney-card mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <img 
                src="/avatar-default.avif" 
                alt="Profile Avatar" 
                className="w-24 h-24 rounded-full object-cover border-2 border-disney-light-blue"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold disney-title mb-2">
                  {privyUser?.email?.address ? getUsername(privyUser.email.address) : 
                   privyUser?.google?.name || '@disney-fan'}
                </h1>
                <p className="text-gray-400 mb-4">{privyUser?.email?.address || 'Connected via Privy'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Pins Collected</p>
                    <p className="text-2xl font-bold text-disney-light-blue">{userStats.pinsCollected}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="text-lg font-semibold">{userStats.joinDate}</p>
                  </div>
                </div>
                <button onClick={handleSignOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <div className="disney-card mb-8">
            <h2 className="text-2xl font-bold mb-6 disney-title">My Pins Collection</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myPins.map((pin) => (
                <div key={pin.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 text-center transform transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-600">
                  <div className="text-5xl mb-2">{pin.emoji}</div>
                  <h3 className="font-semibold text-sm">{pin.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${
                    pin.rarity === 'Legendary' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
                    pin.rarity === 'Epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white' :
                    pin.rarity === 'Rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {pin.rarity}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/collections" className="disney-button">
                View All Collections
              </Link>
            </div>
          </div>
          
          <div className="disney-card">
            <h2 className="text-2xl font-bold mb-6 disney-title">Add Pass to Wallet</h2>
            <p className="text-gray-400 mb-6">Add your Disney Pinnacle pass to your mobile wallet for easy access to your collection and NFC features.</p>
            <AddToWalletButton />
          </div>
        </div>
      </main>
    </>
  )
}