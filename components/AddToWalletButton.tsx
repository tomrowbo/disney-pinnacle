'use client'

import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

export default function AddToWalletButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [passUrl, setPassUrl] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    // Subscribe to Flow authentication state
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])

  const createPass = async () => {
    setIsLoading(true)
    
    try {
      // Get wallet address from Flow user
      const walletAddress = user?.addr
      
      if (!walletAddress) {
        alert('No wallet found. Please connect your Flow wallet first.')
        return
      }

      const response = await fetch('/api/create-pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          userEmail: `${walletAddress.slice(0, 6)}@flow.wallet`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create pass')
      }

      const data = await response.json()
      setPassUrl(data.passUrl)
      
      console.log('Pass response:', data)
      
      // For iOS/mobile, navigate directly to the pass URL
      // This works better than window.open which often gets blocked
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = data.passUrl
      } else {
        // Desktop - open in new tab
        window.open(data.passUrl, '_blank')
      }
      
    } catch (error) {
      console.error('Error creating pass:', error)
      alert('Failed to create pass. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="text-center">
      <button
        onClick={createPass}
        disabled={isLoading}
        className="disney-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Creating Pass... </span>
          </div>
        ) : (
          'Add Pass to Wallet'
        )}
      </button>

      {passUrl && (
        <div className="mt-4 p-3 bg-green-600 text-green-100 rounded-lg">
          <p className="text-sm mb-2">✅ Pass created successfully!</p>
          <a 
            href={passUrl} 
            className="text-white underline hover:text-green-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Pass in Wallet
          </a>
        </div>
      )}
    </div>
  )
}