'use client'

import { useState, useEffect } from 'react'
import * as fcl from '@onflow/fcl'

interface Badge {
  id: number
  name: string
  description: string
  image: string
  emoji?: string
  rarity: string
  attributes: any
}

interface BadgeResponse {
  success: boolean
  transactionId: string
  badge?: Badge
  metadata: any
  message: string
  isSimulated?: boolean
  blockchainStatus?: string
  explorerUrl?: string
  requiresCollectionSetup?: boolean
  userAddress?: string
  note?: string
}

interface CreateBadgeButtonProps {
  onBadgeCreated?: () => void
}

export default function CreateBadgeButton({ onBadgeCreated }: CreateBadgeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastBadge, setLastBadge] = useState<Badge | null>(null)
  const [lastResponse, setLastResponse] = useState<BadgeResponse | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isSettingUpCollection, setIsSettingUpCollection] = useState(false)
  const [setupStatus, setSetupStatus] = useState('')
  
  useEffect(() => {
    // Subscribe to authentication state
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    return () => unsubscribe()
  }, [])

  const setupCollection = async () => {
    try {
      setIsSettingUpCollection(true)
      setSetupStatus('Preparing transaction...')
      
      if (!user?.addr) {
        throw new Error('No Flow wallet connected')
      }
      
      console.log('Setting up collection for Flow address:', user.addr)
      
      // Collection setup transaction for Flow wallet
      const setupTransaction = `
        import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
        import NonFungibleToken from 0x631e88ae7f1d7c20

        transaction() {
          prepare(signer: auth(SaveValue, IssueStorageCapabilityController, PublishCapability, BorrowValue) &Account) {
            // Check if collection already exists
            if signer.storage.borrow<&DisneyPinnacleNFT.Collection>(from: DisneyPinnacleNFT.CollectionStoragePath) != nil {
              log("Collection already exists")
              return
            }
            
            // Create empty collection
            let collection <- DisneyPinnacleNFT.createEmptyCollection(nftType: Type<@DisneyPinnacleNFT.NFT>())
            
            // Save collection to storage
            signer.storage.save(<-collection, to: DisneyPinnacleNFT.CollectionStoragePath)
            
            // Create and publish public capability
            let cap = signer.capabilities.storage.issue<&DisneyPinnacleNFT.Collection>(
              DisneyPinnacleNFT.CollectionStoragePath
            )
            signer.capabilities.publish(cap, at: DisneyPinnacleNFT.CollectionPublicPath)
            
            log("Collection set up successfully")
          }
        }
      `
      
      console.log('Sending collection setup transaction to Flow wallet...')
      setSetupStatus('Please sign the transaction in your wallet...')
      
      // Use FCL to send transaction - user signs with their Flow wallet
      const transactionId = await fcl.mutate({
        cadence: setupTransaction,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 1000
      })
      
      console.log('Collection setup transaction submitted:', transactionId)
      setSetupStatus('Transaction submitted, waiting for confirmation...')
      
      // Don't wait for sealing - just wait for execution (faster)
      const result = await fcl.tx(transactionId).onceExecuted()
      console.log('Collection setup executed:', result)
      
      if (result.status === 4) {
        console.log('Transaction failed during execution')
        throw new Error('Transaction failed during execution')
      }
      
      setSetupStatus('Collection setup complete!')
      
      // Clear the last response to trigger refresh
      setLastResponse(null)
      
      // Notify parent to refresh
      if (onBadgeCreated) {
        onBadgeCreated()
      }
      
    } catch (error) {
      console.error('Collection setup failed:', error)
      setSetupStatus('Setup failed - please try again')
      // Don't throw - just log and reset
    } finally {
      setIsSettingUpCollection(false)
      // Clear status after a delay
      setTimeout(() => setSetupStatus(''), 3000)
    }
  }

  const createBadge = async () => {
    setIsLoading(true)
    
    try {
      // Get wallet address from Flow user
      const walletAddress = user?.addr
      
      if (!walletAddress) {
        // If no wallet connected, trigger Flow wallet connection
        await fcl.authenticate()
        return
      }

      console.log('Using Flow wallet address:', walletAddress)
      
      // Use Flow native minting
      const response = await fetch('/api/create-badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })

      const data = await response.json()
      
      console.log('Minting response:', data)
      
      // Handle error responses (like collection setup required)
      if (!response.ok) {
        // Still show the response data for error states like collection setup
        setLastResponse(data)
        setLastBadge(null)
        
        // Don't throw error for collection setup - let UI handle it
        if (!data.requiresCollectionSetup) {
          throw new Error(data.error || 'Failed to create badge')
        }
        return
      }
      
      // Handle successful responses
      if (data.badge) {
        setLastBadge(data.badge)
      } else {
        // No badge data - it was minted on-chain with random selection
        setLastBadge(null)
      }
      setLastResponse(data)
      
      // Notify parent component to refresh badges
      if (onBadgeCreated) {
        onBadgeCreated()
      }
      
    } catch (error) {
      console.error('Error creating badge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'text-gray-400 bg-gray-600'
      case 'uncommon':
        return 'text-green-400 bg-green-600'
      case 'rare':
        return 'text-purple-400 bg-purple-600'
      case 'epic':
        return 'text-blue-400 bg-blue-600'
      case 'legendary':
        return 'text-yellow-400 bg-yellow-600'
      default:
        return 'text-gray-400 bg-gray-600'
    }
  }

  return (
    <div className="text-center space-y-4">
      <button
        onClick={createBadge}
        disabled={isLoading}
        className="disney-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Minting Badge...</span>
          </div>
        ) : (
          user?.addr 
            ? 'Create Random Badge' 
            : 'Connect Flow Wallet'
        )}
      </button>
      
      {lastResponse && (
        <div className="disney-card max-w-sm mx-auto mt-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-2">
              {lastResponse?.requiresCollectionSetup ? 'Badge Minted - Setup Needed!' : 
               lastBadge ? 'Latest Badge Minted!' : 'Random Badge Minted!'}
            </h3>
            {lastResponse?.requiresCollectionSetup && (
              <div className="bg-yellow-600 text-yellow-100 text-xs px-3 py-2 rounded-lg mb-3">
                ⚠️ Set up your NFT collection to receive this badge
              </div>
            )}
            {lastResponse?.note && (
              <div className="bg-blue-600 text-blue-100 text-xs px-3 py-2 rounded-lg mb-3">
                ℹ️ {lastResponse.note}
              </div>
            )}
            {lastBadge ? (
              <>
                <div className="mb-4">
                  <img 
                    src={lastBadge.image} 
                    alt={lastBadge.name}
                    className="w-16 h-16 mx-auto rounded-lg object-cover border-2 border-gray-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const emojiDiv = target.nextElementSibling as HTMLElement
                      if (emojiDiv) emojiDiv.style.display = 'block'
                    }}
                  />
                  <div className="text-6xl hidden">{lastBadge.emoji || lastBadge.image}</div>
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{lastBadge.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{lastBadge.description}</p>
                
                <span className={`text-xs px-3 py-1 rounded-full inline-block mb-3 ${getRarityColor(lastBadge.rarity)}`}>
                  {lastBadge.rarity}
                </span>
              </>
            ) : (
              <div className="mb-4">
                <div className="text-6xl mb-4">🎁</div>
                <p className="text-gray-400 text-sm mb-3">
                  Your random Disney badge has been minted!<br/>
                  Check your profile to see which one you got.
                </p>
              </div>
            )}
            
            {lastResponse && (
              <div className="text-xs text-gray-500 mt-3 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    lastResponse.isSimulated 
                      ? 'bg-yellow-600 text-yellow-100' 
                      : 'bg-green-600 text-green-100'
                  }`}>
                    {lastResponse.blockchainStatus || 'Status Unknown'}
                  </span>
                </div>
                
                <div className="break-all">
                  <p>Transaction ID:</p>
                  <p className="font-mono">{lastResponse.transactionId}</p>
                </div>
                
                {lastResponse.explorerUrl && !lastResponse.isSimulated && (
                  <div className="pt-2">
                    <a 
                      href={lastResponse.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-xs"
                    >
                      View on Flow Explorer →
                    </a>
                  </div>
                )}
              </div>
            )}
            
            {lastResponse?.requiresCollectionSetup && (
              <div className="mt-4">
                <button
                  onClick={setupCollection}
                  disabled={isSettingUpCollection}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSettingUpCollection ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{setupStatus || 'Setting Up Collection...'}</span>
                    </div>
                  ) : (
                    'Set Up Collection & Receive Badge'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 max-w-md mx-auto space-y-2">
        <p>
          Each badge is randomly selected using Flow blockchain's onchain randomness. 
          Collect all 5 Disney pin badges!
        </p>
      </div>
    </div>
  )
}