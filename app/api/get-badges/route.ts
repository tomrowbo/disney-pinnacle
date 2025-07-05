import { NextRequest, NextResponse } from 'next/server'
import * as sdk from '@onflow/sdk'

// Flow testnet configuration
sdk.config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

// Real blockchain implementation to get user's NFTs
const getUserBadges = async (walletAddress: string) => {
  try {
    console.log('Fetching NFTs from Flow blockchain for wallet:', walletAddress)
    
    // Script to get basic NFT IDs first, then we'll enhance
    const getNFTsScript = `
      import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
      import NonFungibleToken from 0x631e88ae7f1d7c20
      
      access(all) fun main(address: Address): [UInt64] {
        let account = getAccount(address)
        
        // Try to borrow the public collection capability  
        if let collectionRef = account.capabilities.borrow<&{NonFungibleToken.Collection}>(DisneyPinnacleNFT.CollectionPublicPath) {
          return collectionRef.getIDs()
        }
        
        // Return empty array if no collection found
        return []
      }
    `
    
    // Query the blockchain for NFTs
    const nftData = await sdk.send([
      sdk.script(getNFTsScript),
      sdk.args([
        sdk.arg(walletAddress, sdk.t.Address)
      ])
    ]).then(sdk.decode)
    
    console.log('Retrieved NFT IDs from blockchain:', nftData)
    
    // If we have NFT IDs, get metadata for each one
    if (nftData && nftData.length > 0) {
      const badges = []
      
      for (const id of nftData) {
        try {
          // Script to get individual NFT metadata including mint timestamp
          const getNFTMetadataScript = `
            import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
            import NonFungibleToken from 0x631e88ae7f1d7c20
            
            access(all) fun main(address: Address, nftId: UInt64): {String: String}? {
              let account = getAccount(address)
              
              if let collectionRef = account.capabilities.borrow<&{NonFungibleToken.Collection}>(DisneyPinnacleNFT.CollectionPublicPath) {
                if let nft = collectionRef.borrowNFT(nftId) as? &DisneyPinnacleNFT.NFT {
                  return {
                    "id": nft.id.toString(),
                    "name": nft.name,
                    "description": nft.description,
                    "thumbnail": nft.thumbnail,
                    "badgeType": nft.badgeType.rawValue.toString(),
                    "mintedAt": nft.mintedAt.toString()
                  }
                }
              }
              
              return nil
            }
          `
          
          const metadata = await sdk.send([
            sdk.script(getNFTMetadataScript),
            sdk.args([
              sdk.arg(walletAddress, sdk.t.Address),
              sdk.arg(id.toString(), sdk.t.UInt64)
            ])
          ]).then(sdk.decode)
          
          if (metadata) {
            const badgeType = parseInt(metadata.badgeType)
            const badgeEmojis = ['🐭', '🎀', '🦆', '🐶', '🏰']
            const badgeRarities = ['Common', 'Common', 'Uncommon', 'Uncommon', 'Rare']
            
            badges.push({
              id: `disney-pin-${metadata.id}`,
              tokenId: parseInt(metadata.id),
              name: metadata.name,
              description: metadata.description,
              image: metadata.thumbnail,
              emoji: badgeEmojis[badgeType] || '🎁',
              rarity: badgeRarities[badgeType] || 'Common',
              attributes: {
                badgeType: badgeType,
                series: 'Disney Collection',
                year: '2025'
              },
              mintedAt: metadata.mintedAt ? new Date(parseFloat(metadata.mintedAt) * 1000).toISOString() : new Date().toISOString(),
              transactionId: `flow-nft-${metadata.id}`,
              isBlockchainData: true
            })
          }
        } catch (metadataError) {
          console.error(`Error fetching metadata for NFT ${id}:`, metadataError)
        }
      }
      
      return badges
    }
    
    // Return empty array if no NFTs found
    return []
    
  } catch (error) {
    console.error('Error fetching from blockchain:', error)
    
    // No fallbacks - throw the real error
    throw error
  }
}

// Helper functions for badge metadata
const getBadgeEmoji = (badgeType: number) => {
  const emojis = ['🐭', '🎀', '🦆', '🐶', '🏰']
  return emojis[badgeType] || '🎁'
}

const getBadgeRarity = (badgeType: number) => {
  const rarities = ['Common', 'Common', 'Uncommon', 'Uncommon', 'Rare']
  return rarities[badgeType] || 'Common'
}

const getBadgeAttributes = (badgeType: number) => {
  const attributes = [
    { character: 'Mickey Mouse', series: 'Classic Collection', year: '2025' },
    { character: 'Minnie Mouse', series: 'Classic Collection', year: '2025' },
    { character: 'Donald Duck', series: 'Classic Collection', year: '2025' },
    { character: 'Goofy', series: 'Classic Collection', year: '2025' },
    { location: 'Magic Kingdom', series: 'Castle Collection', year: '2025' }
  ]
  return attributes[badgeType] || { series: 'Disney Collection', year: '2025' }
}

// Fallback demo data when blockchain is not available
const getFallbackBadges = () => {
  return [
    {
      id: 'disney-pin-1',
      tokenId: 1,
      name: 'Mickey Mouse Classic',
      description: 'The iconic Mickey Mouse head silhouette',
      image: 'https://easydrawingguides.com/wp-content/uploads/2022/07/easy-Mickey-Mouse-face-11.png',
      emoji: '🐭',
      rarity: 'Common',
      attributes: {
        character: 'Mickey Mouse',
        series: 'Classic Collection',
        year: '2025'
      },
      mintedAt: '2025-07-04T20:30:00Z',
      transactionId: '0x1234567890abcdef'
    },
    {
      id: 'disney-pin-3',
      tokenId: 3,
      name: 'Donald Duck Sailor',
      description: 'Donald Duck in his classic sailor outfit',
      image: 'https://static.wikia.nocookie.net/characters/images/6/6f/Donald_Duck.png/revision/latest?cb=20240325202709',
      emoji: '🦆',
      rarity: 'Uncommon',
      attributes: {
        character: 'Donald Duck',
        series: 'Classic Collection',
        year: '2025'
      },
      mintedAt: '2025-07-04T20:59:59Z',
      transactionId: '0xabcdef1234567890'
    }
  ]
}

export async function POST(request: NextRequest) {
  const { walletAddress } = await request.json()
    
    console.log('Getting badges for wallet:', walletAddress)
    
    if (!walletAddress) {
      console.error('No wallet address provided')
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }
    
    // Validate Flow address format
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 18) {
      return NextResponse.json({ 
        error: 'Invalid address format - must be Flow address (0x + 16 hex chars)',
        badges: [],
        count: 0
      }, { status: 400 })
    }

    const userBadges = await getUserBadges(walletAddress)
    
    console.log(`Found ${userBadges.length} badges for wallet ${walletAddress}`)
    
    return NextResponse.json({
      success: true,
      badges: userBadges,
      count: userBadges.length,
      isBlockchainData: userBadges.length > 0 && userBadges[0].transactionId !== '0x1234567890abcdef'
    })

}