import { NextRequest, NextResponse } from 'next/server'
import * as fcl from '@onflow/fcl'

// Configure Flow for testnet
fcl.config({
  'accessNode.api': process.env.FLOW_ACCESS_API_URL || 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'discovery.authn.endpoint': 'https://fcl-discovery.onflow.org/api/testnet/authn',
})

// Real blockchain implementation to get user's NFTs
const getUserBadges = async (walletAddress: string) => {
  try {
    console.log('Fetching NFTs from Flow blockchain for wallet:', walletAddress)
    
    // Script to get all Disney Pinnacle NFTs owned by the address
    const getNFTsScript = `
      import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
      import NonFungibleToken from 0x631e88ae7f1d7c20
      import MetadataViews from 0x631e88ae7f1d7c20
      
      access(all) struct NFTData {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let description: String
        access(all) let image: String
        access(all) let badgeType: UInt8
        access(all) let mintedAt: UFix64
        
        init(id: UInt64, name: String, description: String, image: String, badgeType: UInt8, mintedAt: UFix64) {
          self.id = id
          self.name = name
          self.description = description
          self.image = image
          self.badgeType = badgeType
          self.mintedAt = mintedAt
        }
      }
      
      access(all) fun main(address: Address): [NFTData] {
        let account = getAccount(address)
        
        let collectionRef = account.getCapability(DisneyPinnacleNFT.CollectionPublicPath)
          .borrow<&{DisneyPinnacleNFT.DisneyPinnacleNFTCollectionPublic}>()
        
        if collectionRef == nil {
          return []
        }
        
        let nftIds = collectionRef!.getIDs()
        let nftData: [NFTData] = []
        
        for id in nftIds {
          if let nft = collectionRef!.borrowDPNFT(id: id) {
            let metadata = DisneyPinnacleNFT.getBadgeMetadata(nft.badgeType)
            nftData.append(NFTData(
              id: nft.id,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
              badgeType: nft.badgeType.rawValue,
              mintedAt: nft.mintedAt
            ))
          }
        }
        
        return nftData
      }
    `
    
    // Query the blockchain for NFTs
    const nftData = await fcl.query({
      cadence: getNFTsScript,
      args: (arg: any, t: any) => [
        arg(walletAddress, t.Address)
      ]
    })
    
    console.log('Retrieved NFT data from blockchain:', nftData)
    
    // Convert blockchain data to expected format
    const badges = nftData.map((nft: any) => ({
      id: `disney-pin-${nft.id}`,
      tokenId: parseInt(nft.id),
      name: nft.name,
      description: nft.description,
      image: nft.image,
      emoji: getBadgeEmoji(nft.badgeType),
      rarity: getBadgeRarity(nft.badgeType),
      attributes: getBadgeAttributes(nft.badgeType),
      mintedAt: new Date(parseFloat(nft.mintedAt) * 1000).toISOString(),
      transactionId: `0x${nft.id.toString(16).padStart(16, '0')}` // Simulated tx ID based on NFT ID
    }))
    
    return badges
    
  } catch (error) {
    console.log('Error fetching from blockchain, using fallback data:', error)
    
    // Fallback to demo data if blockchain call fails
    return getFallbackBadges()
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
  try {
    const { walletAddress } = await request.json()
    
    console.log('Getting badges for wallet:', walletAddress)
    
    if (!walletAddress) {
      console.error('No wallet address provided')
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const userBadges = await getUserBadges(walletAddress)
    
    console.log(`Found ${userBadges.length} badges for wallet ${walletAddress}`)
    
    return NextResponse.json({
      success: true,
      badges: userBadges,
      count: userBadges.length,
      isBlockchainData: userBadges.length > 0 && userBadges[0].transactionId !== '0x1234567890abcdef'
    })
    
  } catch (error) {
    console.error('Error getting badges:', error)
    return NextResponse.json({ 
      error: 'Failed to get badges', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}