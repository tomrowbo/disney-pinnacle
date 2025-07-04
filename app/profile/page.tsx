'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [user] = useState({
    name: 'Mickey Mouse',
    email: 'mickey@disney.com',
    profilePic: '🐭',
    pinsCollected: 42,
    tradingScore: 98,
    joinDate: 'December 2024'
  })
  
  const handleSignOut = () => {
    router.push('/')
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
              <div className="text-8xl">{user.profilePic}</div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold disney-title mb-2">{user.name}</h1>
                <p className="text-gray-400 mb-4">{user.email}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Pins Collected</p>
                    <p className="text-2xl font-bold text-disney-light-blue">{user.pinsCollected}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trading Score</p>
                    <p className="text-2xl font-bold text-disney-purple">{user.tradingScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-lg font-semibold">{user.joinDate}</p>
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
            <h2 className="text-2xl font-bold mb-6 disney-title">Download Disney Pinnacle App</h2>
            <p className="text-gray-400 mb-6">Take your collection on the go! Trade and collect pins anywhere with our mobile app.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              <a href="#" className="bg-black text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                </svg>
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}