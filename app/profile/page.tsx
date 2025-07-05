'use client'

import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as fcl from '@onflow/fcl'
import AddToWalletButton from '@/components/AddToWalletButton'
import CreateBadgeButton from '@/components/CreateBadgeButton'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState({
    pinsCollected: 0,
    joinDate: 'July 2025'
  })
  
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)
  
  const getUsername = (address: string) => {
    return `@${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  const fetchUserBadges = async () => {
    const walletAddress = user?.addr
    if (!walletAddress) return
    
    setBadgesLoading(true)
    try {
      const response = await fetch('/api/get-badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserBadges(data.badges)
        setUserStats(prev => ({
          ...prev,
          pinsCollected: data.count
        }))
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setBadgesLoading(false)
    }
  }
  
  useEffect(() => {
    // Subscribe to Flow authentication state
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])
  
  useEffect(() => {
    if (user?.addr) {
      fetchUserBadges()
    } else if (user && !user.addr) {
      router.push('/')
    }
  }, [user, router])
  
  const handleSignOut = () => {
    fcl.unauthenticate()
    router.push('/')
  }
  
  if (!user?.addr) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="disney-card">
            <p className="text-white">Please connect your Flow wallet to view your profile</p>
          </div>
        </main>
      </>
    )
  }
  
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
      case 'uncommon':
        return 'bg-gradient-to-r from-green-400 to-green-600 text-white'
      case 'rare':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
      case 'epic':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
      default:
        return 'bg-gray-600 text-gray-300'
    }
  }
  
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
                  {getUsername(user.addr)}
                </h1>
                <p className="text-gray-400 mb-4">{user.addr}</p>
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
            <h2 className="text-2xl font-bold mb-6 disney-title">My NFT Badges Collection</h2>
            
            {badgesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-disney-light-blue"></div>
                <span className="ml-3 text-gray-400">Loading badges...</span>
              </div>
            ) : userBadges.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userBadges.map((badge) => (
                    <div key={badge.id} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 text-center transform transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-600">
                      <div className="mb-4">
                        <img 
                          src={badge.image} 
                          alt={badge.name}
                          className="w-20 h-20 mx-auto rounded-lg object-cover border-2 border-gray-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const emojiDiv = target.nextElementSibling as HTMLElement
                            if (emojiDiv) emojiDiv.style.display = 'block'
                          }}
                        />
                        <div className="text-5xl hidden">{badge.emoji}</div>
                      </div>
                      <h3 className="font-semibold text-lg text-white mb-2">{badge.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{badge.description}</p>
                      <span className={`text-xs px-3 py-1 rounded-full inline-block mb-2 ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                      <div className="text-xs text-gray-500 mt-2">
                        <p>Token ID: {badge.tokenId}</p>
                        <p>Minted: {new Date(badge.mintedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    {userBadges.length} NFT badge{userBadges.length !== 1 ? 's' : ''} collected
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-semibold text-white mb-2">No badges yet!</h3>
                <p className="text-gray-400 mb-6">Start minting Disney pin NFT badges to build your collection.</p>
              </div>
            )}
          </div>
          
          <div className="disney-card">
            <h2 className="text-2xl font-bold mb-6 disney-title">Add Pass to Wallet</h2>
            <p className="text-gray-400 mb-6">Add your Disney Pinnacle pass to your mobile wallet for easy access to your collection and NFC features.</p>
            <AddToWalletButton />
          </div>
          
          <div className="disney-card">
            <h2 className="text-2xl font-bold mb-6 disney-title">Mint Random Badge</h2>
            <p className="text-gray-400 mb-6">Use Flow blockchain's onchain randomness to mint a random Disney pin NFT badge. Each badge is unique and stored on the blockchain!</p>
            <CreateBadgeButton onBadgeCreated={fetchUserBadges} />
          </div>
        </div>
      </main>
    </>
  )
}