'use client'

import { useState } from 'react'
import * as fcl from '@onflow/fcl'

// Configure FCL for testnet
fcl.config({
  'app.detail.title': 'Disney Pinnacle',
  'app.detail.icon': '/pinnacle-logo.png',
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/api/testnet/authn'
})

interface FlowCollectionSetupProps {
  onSetupComplete?: () => void
  contractAddress: string
}

export default function FlowCollectionSetup({ onSetupComplete, contractAddress }: FlowCollectionSetupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'setting-up' | 'complete'>('idle')

  // Connect Flow wallet
  const connectWallet = async () => {
    try {
      const currentUser = await fcl.authenticate()
      setUser(currentUser)
      return currentUser.addr
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  // Check if user has collection
  const checkCollection = async (address: string) => {
    const script = `
      import DisneyPinnacleNFT from ${contractAddress}
      import NonFungibleToken from 0x631e88ae7f1d7c20
      
      access(all) fun main(address: Address): Bool {
        let account = getAccount(address)
        return account.capabilities.borrow<&{NonFungibleToken.Collection}>(DisneyPinnacleNFT.CollectionPublicPath) != nil
      }
    `
    
    return await fcl.query({
      cadence: script,
      args: (arg: any, t: any) => [arg(address, t.Address)]
    })
  }

  // Setup collection transaction
  const setupCollection = async () => {
    const transaction = `
      import DisneyPinnacleNFT from ${contractAddress}
      import NonFungibleToken from 0x631e88ae7f1d7c20
      
      transaction {
        prepare(acct: auth(IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
          // Check if collection already exists
          if acct.storage.borrow<&{NonFungibleToken.Collection}>(from: DisneyPinnacleNFT.CollectionStoragePath) != nil {
            return
          }
          
          // Create a new empty collection
          let collection <- DisneyPinnacleNFT.createEmptyCollection(nftType: Type<@DisneyPinnacleNFT.NFT>())
          
          // Save it to the account
          acct.storage.save(<-collection, to: DisneyPinnacleNFT.CollectionStoragePath)
          
          // Create a public capability for the collection
          let collectionCap = acct.capabilities.storage.issue<&DisneyPinnacleNFT.Collection>(
            DisneyPinnacleNFT.CollectionStoragePath
          )
          acct.capabilities.publish(collectionCap, at: DisneyPinnacleNFT.CollectionPublicPath)
        }
        
        execute {
          log("DisneyPinnacleNFT collection created successfully!")
        }
      }
    `

    const transactionId = await fcl.mutate({
      cadence: transaction,
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      authorizations: [fcl.currentUser],
      limit: 100
    })

    // Wait for transaction to be sealed
    const txResult = await fcl.tx(transactionId).onceSealed()
    return txResult
  }

  // Main setup flow
  const handleSetup = async () => {
    setIsLoading(true)
    setSetupStatus('checking')

    try {
      // Step 1: Connect wallet
      const address = user?.addr || await connectWallet()
      
      // Step 2: Check if collection exists
      const hasCollection = await checkCollection(address)
      
      if (hasCollection) {
        setSetupStatus('complete')
        if (onSetupComplete) onSetupComplete()
        return
      }

      // Step 3: Setup collection
      setSetupStatus('setting-up')
      await setupCollection()
      
      setSetupStatus('complete')
      if (onSetupComplete) onSetupComplete()
      
    } catch (error) {
      console.error('Setup failed:', error)
      setSetupStatus('idle')
      alert('Failed to setup collection. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!user ? (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="disney-button w-full"
        >
          Connect Flow Wallet
        </button>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">
            Connected: {user.addr}
          </p>
        </div>
      )}

      {setupStatus === 'checking' && (
        <p className="text-center text-gray-400">Checking collection status...</p>
      )}

      {setupStatus === 'setting-up' && (
        <p className="text-center text-gray-400">Setting up your collection...</p>
      )}

      {setupStatus === 'complete' && (
        <p className="text-center text-green-400">✓ Collection ready!</p>
      )}

      {user && setupStatus !== 'complete' && (
        <button
          onClick={handleSetup}
          disabled={isLoading}
          className="disney-button w-full"
        >
          Setup NFT Collection
        </button>
      )}
    </div>
  )
}