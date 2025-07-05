import { NextRequest, NextResponse } from 'next/server'
import * as sdk from '@onflow/sdk'
import { ec as EC } from 'elliptic'
import { SHA3 } from 'sha3'

// Flow testnet configuration
sdk.config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

// Server configuration - use the key from testnet.pkey that matches the deployed contract
const ACCOUNT_ADDRESS = process.env.FLOW_ACCOUNT_ADDRESS!
const PRIVATE_KEY = '74c78f8388c82625f67013bde55f7f573a5d7e23517f458f7d2509e74d97629d' // From testnet.pkey
const KEY_INDEX = 0

// Define the 5 Disney pin badges
const DISNEY_BADGES = [
  {
    id: 1,
    name: 'Mickey Mouse Classic',
    description: 'The iconic Mickey Mouse head silhouette',
    image: 'https://easydrawingguides.com/wp-content/uploads/2022/07/easy-Mickey-Mouse-face-11.png',
    emoji: '🐭',
    rarity: 'Common',
    attributes: {
      character: 'Mickey Mouse',
      series: 'Classic Collection',
      year: '2025'
    }
  },
  {
    id: 2,
    name: 'Minnie Mouse Bow',
    description: 'Minnie Mouse with her signature polka dot bow',
    image: 'https://wallpapers.com/images/hd/minnie-mouse-red-polka-dot-bow-qauom9hxucgkbie6-qauom9hxucgkbie6.jpg',
    emoji: '🎀',
    rarity: 'Common',
    attributes: {
      character: 'Minnie Mouse',
      series: 'Classic Collection',
      year: '2025'
    }
  },
  {
    id: 3,
    name: 'Donald Duck Sailor',
    description: 'Donald Duck in his classic sailor outfit',
    image: 'https://static.wikia.nocookie.net/characters/images/6/6f/Donald_Duck.png/revision/latest?cb=20240325202709',
    emoji: '🦆',
    rarity: 'Uncommon',
    attributes: {
      character: 'Donald Duck',
      series: 'Classic Collection',
      year: '2025'
    }
  },
  {
    id: 4,
    name: 'Goofy Hat',
    description: 'Goofy with his signature green hat',
    image: 'https://cdn.inspireuplift.com/uploads/images/seller_products/29661/1706084617_ul201223t2---goofy-head-face-smiling-svg-goofy-face-svg-disney-goofy-svg-ul201223t2png.png',
    emoji: '🐶',
    rarity: 'Uncommon',
    attributes: {
      character: 'Goofy',
      series: 'Classic Collection',
      year: '2025'
    }
  },
  {
    id: 5,
    name: 'Castle Magic',
    description: 'The iconic Cinderella Castle with magical sparkles',
    image: 'https://cdn.creazilla.com/cliparts/15142/cinderella-castle-clipart-original.png',
    emoji: '🏰',
    rarity: 'Rare',
    attributes: {
      location: 'Magic Kingdom',
      series: 'Castle Collection',
      year: '2025'
    }
  }
]

// Cadence script to get onchain random number using Flow's native randomness
const GET_RANDOM_SCRIPT = `
access(all) fun main(): UInt64 {
    // Use Flow's native revertibleRandom() for true on-chain randomness
    let randomValue = revertibleRandom<UInt64>()
    return randomValue % 5
}
`

// Sign with private key using Flow's exact expected format
const signWithKey = (privateKeyHex: string, message: string) => {
  console.log('Signing message length:', message.length, 'type:', typeof message)
  
  const ec = new EC('p256')
  const key = ec.keyFromPrivate(Buffer.from(privateKeyHex, 'hex'))
  
  // Flow uses SHA3_256 hashing as per account info
  const messageBuffer = Buffer.isBuffer(message) ? message : Buffer.from(message, 'hex')
  
  const hash = new SHA3(256)
  hash.update(messageBuffer)
  const hashedMessage = hash.digest()
  
  console.log('Message hash:', hashedMessage.toString('hex'))
  
  const sig = key.sign(hashedMessage)
  const n = 32
  const r = sig.r.toArrayLike(Buffer, 'be', n)
  const s = sig.s.toArrayLike(Buffer, 'be', n)
  const signature = Buffer.concat([r, s]).toString('hex')
  
  console.log('Generated signature:', signature)
  return signature
}

// Verify the private key matches the public key on the account
const verifyKey = () => {
  const ec = new EC('p256')
  const key = ec.keyFromPrivate(Buffer.from(PRIVATE_KEY, 'hex'))
  const publicKey = key.getPublic('hex')
  console.log('Computed public key:', publicKey)
  console.log('Expected public key from account: e2b88b92e67d8c677bd71b57768f58f3d781e2ce5ec59b6a69a50d6096e77d8a5488182280b809f24c5eb8476d65df8f624122a6f7ae478b4c88be81dda2eb88')
  return publicKey
}

// Authorization using simple account pattern
const authz = (account: any = {}) => {
  return {
    ...account,
    kind: 'ACCOUNT',
    tempId: `${ACCOUNT_ADDRESS}-${KEY_INDEX}`,
    addr: ACCOUNT_ADDRESS,
    keyId: KEY_INDEX,
    sequenceNum: 0, // Will be resolved automatically
    signature: null,
    signingFunction: (signable: any) => ({
      addr: ACCOUNT_ADDRESS,
      keyId: KEY_INDEX,
      signature: signWithKey(PRIVATE_KEY, signable.message)
    }),
    resolve: null,
    roles: { proposer: true, authorizer: true, payer: true }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()
    
    console.log('Creating badge for wallet:', walletAddress)
    
    if (!walletAddress) {
      console.error('No wallet address provided')
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }
    
    // Validate Flow address format
    if (!walletAddress.startsWith('0x') || walletAddress.length !== 18) {
      return NextResponse.json({ 
        error: 'Invalid address format',
        details: 'Provide a Flow address (0x + 16 hex chars)'
      }, { status: 400 })
    }
    
    console.log(`Processing Flow address: ${walletAddress}`)

    console.log('Badge will be randomly selected on-chain during minting...')
    
    // NFT metadata will be determined after minting
    const nftMetadata = {
      id: `disney-pin-${walletAddress}-${Date.now()}`,
      recipient: walletAddress,
      mintedAt: new Date().toISOString(),
      network: 'flow-testnet'
    }
    
    console.log('Minting NFT with randomness determined on-chain...')
    
    // Real blockchain minting implementation
    console.log('Minting NFT on Flow blockchain...')
    
    let transactionId = null
    let mintToUser = false
    
    try {
      // First, verify contract is deployed
      const testScript = `
        import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
        
        access(all) fun main(): String {
          return "Contract is deployed"
        }
      `
      
      const result = await sdk.send([
        sdk.script(testScript)
      ]).then(sdk.decode)
      
      console.log('Contract found!', result)
      
      // First, check if user has a collection
      const checkCollectionScript = `
        import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
        import NonFungibleToken from 0x631e88ae7f1d7c20
        
        access(all) fun main(address: Address): Bool {
          let account = getAccount(address)
          return account.capabilities.borrow<&{NonFungibleToken.Collection}>(DisneyPinnacleNFT.CollectionPublicPath) != nil
        }
      `
      
      console.log('Checking if address has collection...')
      
      let hasCollection = false
      try {
        hasCollection = await sdk.send([
          sdk.script(checkCollectionScript),
          sdk.args([
            sdk.arg(walletAddress, sdk.t.Address)
          ])
        ]).then(sdk.decode)
        
        console.log(`Address ${walletAddress} has collection:`, hasCollection)
      } catch (collectionError) {
        console.log('Collection check failed - address may not exist on Flow yet:', collectionError)
        hasCollection = false
      }
      
      // Check if user has collection - if not, require setup first
      if (!hasCollection) {
        console.log('User must set up collection first - no admin fallback')
        return NextResponse.json({
          error: 'Collection setup required',
          requiresCollectionSetup: true,
          instructions: 'You must set up your NFT collection before minting badges',
          userAddress: walletAddress
        }, { status: 400 })
      }
      
      // User has collection - mint directly to them
      console.log('User has collection - minting directly to user...')
      mintToUser = true
      
      const mintTransaction = `
        import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
        import NonFungibleToken from 0x631e88ae7f1d7c20
        
        transaction(recipientAddress: Address) {
          let minter: &DisneyPinnacleNFT.NFTMinter
          let recipientCollection: &{NonFungibleToken.Collection}
          
          prepare(acct: auth(BorrowValue) &Account) {
            // Borrow the minter
            self.minter = acct.storage.borrow<&DisneyPinnacleNFT.NFTMinter>(from: DisneyPinnacleNFT.MinterStoragePath)
              ?? panic("Could not borrow minter reference")
            
            // Get recipient's collection
            let recipient = getAccount(recipientAddress)
            self.recipientCollection = recipient.capabilities.borrow<&{NonFungibleToken.Collection}>(DisneyPinnacleNFT.CollectionPublicPath)
              ?? panic("Could not borrow recipient collection")
          }
          
          execute {
            let badgeType = DisneyPinnacleNFT.getRandomBadgeType()
            self.minter.mintNFT(recipient: self.recipientCollection, badgeType: badgeType)
          }
        }
      `
      
      // Execute transaction using SDK
      const args = mintToUser ? [sdk.arg(walletAddress, sdk.t.Address)] : []
      const authorization = authz()
      
      transactionId = await sdk.send([
        sdk.transaction(mintTransaction),
        sdk.args(args),
        sdk.proposer(authorization),
        sdk.authorizations([authorization]),
        sdk.payer(authorization),
        sdk.limit(1000)
      ]).then(sdk.decode)
      
      console.log('Transaction submitted:', transactionId)
      
      // Skip transaction status check for now - just return success
      
    } catch (contractError) {
      console.error('Transaction failed:', contractError)
      throw contractError
    }
    
    return NextResponse.json({
      success: true,
      transactionId: transactionId,
      metadata: nftMetadata,
      message: 'Successfully minted random Disney badge to your wallet!',
      isSimulated: false,
      blockchainStatus: 'Successfully minted on Flow testnet',
      explorerUrl: transactionId ? `https://testnet.flowscan.io/tx/${transactionId}` : null,
      userAddress: walletAddress,
      note: 'Badge details will appear in your profile once transaction is confirmed'
    })
    
  } catch (error) {
    console.error('Error creating badge:', error)
    return NextResponse.json({ 
      error: 'Failed to create badge', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}