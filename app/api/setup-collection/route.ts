import { NextRequest, NextResponse } from 'next/server'
import * as sdk from '@onflow/sdk'

// Flow testnet configuration
sdk.config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

// Cadence transaction to set up a collection for a user
const SETUP_COLLECTION_TRANSACTION = `
import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
import NonFungibleToken from 0x631e88ae7f1d7c20

transaction {
  prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
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

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()
    
    console.log('Setting up collection for wallet:', walletAddress)
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }
    
    // For now, return instructions for the user
    // In a production app, this would be executed by the user's wallet
    return NextResponse.json({
      success: true,
      message: 'Collection setup transaction prepared',
      instructions: 'User needs to sign and submit this transaction with their wallet',
      transaction: SETUP_COLLECTION_TRANSACTION,
      note: 'In production, this would be handled by FCL or a wallet integration'
    })
    
  } catch (error) {
    console.error('Error setting up collection:', error)
    return NextResponse.json({ 
      error: 'Failed to prepare collection setup', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}