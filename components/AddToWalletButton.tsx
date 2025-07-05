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
      
      // Open the pass URL in a new window/tab
      window.open(data.passUrl, '_blank')
      
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

    </div>
  )
}