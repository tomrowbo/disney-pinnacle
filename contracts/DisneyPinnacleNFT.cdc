/*
*  Disney Pinnacle NFT Contract
*  Based on the Flow NonFungibleToken V2 standard
*  Implements Disney-themed collectible pin badges
*/

import "NonFungibleToken"
import "ViewResolver"
import "MetadataViews"

access(all) contract DisneyPinnacleNFT: NonFungibleToken {

    /// Standard Paths
    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let MinterStoragePath: StoragePath

    /// Events
    access(all) event Minted(
        id: UInt64,
        uuid: UInt64,
        name: String,
        description: String,
        badgeType: String,
        recipient: Address?
    )

    /// Badge Types
    access(all) enum BadgeType: UInt8 {
        access(all) case mickey
        access(all) case minnie  
        access(all) case donald
        access(all) case goofy
        access(all) case castle
    }

    /// Helper function to get badge metadata
    access(all) fun getBadgeMetadata(_ badgeType: BadgeType): {String: String} {
        switch badgeType {
            case BadgeType.mickey:
                return {
                    "name": "Mickey Mouse Classic",
                    "description": "The iconic Mickey Mouse head silhouette",
                    "image": "https://easydrawingguides.com/wp-content/uploads/2022/07/easy-Mickey-Mouse-face-11.png",
                    "rarity": "Common"
                }
            case BadgeType.minnie:
                return {
                    "name": "Minnie Mouse Bow",
                    "description": "Minnie Mouse with her signature polka dot bow",
                    "image": "https://wallpapers.com/images/hd/minnie-mouse-red-polka-dot-bow-qauom9hxucgkbie6-qauom9hxucgkbie6.jpg",
                    "rarity": "Common"
                }
            case BadgeType.donald:
                return {
                    "name": "Donald Duck Sailor",
                    "description": "Donald Duck in his classic sailor outfit",
                    "image": "https://static.wikia.nocookie.net/characters/images/6/6f/Donald_Duck.png/revision/latest?cb=20240325202709",
                    "rarity": "Uncommon"
                }
            case BadgeType.goofy:
                return {
                    "name": "Goofy Hat",
                    "description": "Goofy with his signature green hat",
                    "image": "https://cdn.inspireuplift.com/uploads/images/seller_products/29661/1706084617_ul201223t2---goofy-head-face-smiling-svg-goofy-face-svg-disney-goofy-svg-ul201223t2png.png",
                    "rarity": "Uncommon"
                }
            case BadgeType.castle:
                return {
                    "name": "Castle Magic",
                    "description": "The iconic Cinderella Castle with magical sparkles",
                    "image": "https://cdn.creazilla.com/cliparts/15142/cinderella-castle-clipart-original.png",
                    "rarity": "Rare"
                }
            default:
                return {}
        }
    }

    /// NFT Resource
    access(all) resource NFT: NonFungibleToken.NFT {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let description: String
        access(all) let thumbnail: String
        access(all) let badgeType: BadgeType
        access(all) let mintedAt: UFix64

        init(badgeType: BadgeType) {
            self.id = self.uuid
            self.badgeType = badgeType
            self.mintedAt = getCurrentBlock().timestamp
            
            let metadata = DisneyPinnacleNFT.getBadgeMetadata(badgeType)
            self.name = metadata["name"] ?? "Disney Badge"
            self.description = metadata["description"] ?? "A Disney collectible badge"
            self.thumbnail = metadata["image"] ?? ""
        }

        /// createEmptyCollection creates an empty Collection for this NFT type
        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-DisneyPinnacleNFT.createEmptyCollection(nftType: Type<@DisneyPinnacleNFT.NFT>())
        }

        access(all) view fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Traits>()
            ]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.name,
                        description: self.description,
                        thumbnail: MetadataViews.HTTPFile(url: self.thumbnail)
                    )
                case Type<MetadataViews.ExternalURL>():
                    return MetadataViews.ExternalURL("https://disneypinnacle.com/nft/".concat(self.id.toString()))
                case Type<MetadataViews.NFTCollectionData>():
                    return DisneyPinnacleNFT.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>())
                case Type<MetadataViews.NFTCollectionDisplay>():
                    return DisneyPinnacleNFT.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionDisplay>())
                case Type<MetadataViews.Traits>():
                    let metadata = DisneyPinnacleNFT.getBadgeMetadata(self.badgeType)
                    let traits: [MetadataViews.Trait] = []
                    traits.append(MetadataViews.Trait(name: "Badge Type", value: self.badgeType.rawValue, displayType: nil, rarity: nil))
                    traits.append(MetadataViews.Trait(name: "Rarity", value: metadata["rarity"] ?? "Common", displayType: nil, rarity: nil))
                    return MetadataViews.Traits(traits)
            }
            return nil
        }
    }

    /// Collection Resource
    access(all) resource Collection: NonFungibleToken.Collection {
        access(all) var ownedNFTs: @{UInt64: {NonFungibleToken.NFT}}

        init() {
            self.ownedNFTs <- {}
        }

        /// getSupportedNFTTypes returns a list of NFT types that this receiver accepts
        access(all) view fun getSupportedNFTTypes(): {Type: Bool} {
            let supportedTypes: {Type: Bool} = {}
            supportedTypes[Type<@DisneyPinnacleNFT.NFT>()] = true
            return supportedTypes
        }

        /// isSupportedNFTType returns whether or not the given type is accepted by the collection
        access(all) view fun isSupportedNFTType(type: Type): Bool {
            return type == Type<@DisneyPinnacleNFT.NFT>()
        }

        /// createEmptyCollection creates an empty Collection of the same type
        access(all) fun createEmptyCollection(): @{NonFungibleToken.Collection} {
            return <-DisneyPinnacleNFT.createEmptyCollection(nftType: Type<@DisneyPinnacleNFT.NFT>())
        }

        /// getLength returns the number of NFTs stored in the collection
        access(all) view fun getLength(): Int {
            return self.ownedNFTs.keys.length
        }

        /// getIDs returns an array of the IDs that are in the collection
        access(all) view fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        /// borrowNFT Returns a borrowed reference to an NFT in the collection
        access(all) view fun borrowNFT(_ id: UInt64): &{NonFungibleToken.NFT}? {
            return &self.ownedNFTs[id]
        }

        /// borrowViewResolver returns a borrowed reference to an NFT in the collection
        access(all) view fun borrowViewResolver(id: UInt64): &{ViewResolver.Resolver}? {
            if let nft = &self.ownedNFTs[id] as &{NonFungibleToken.NFT}? {
                return nft as &{ViewResolver.Resolver}
            }
            return nil
        }

        /// withdraw removes an NFT from the collection and moves it to the caller
        access(NonFungibleToken.Withdraw) fun withdraw(withdrawID: UInt64): @{NonFungibleToken.NFT} {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Could not withdraw an NFT with the provided ID from the collection")
            return <-token
        }

        /// deposit takes an NFT as an argument and stores it in the collection
        access(all) fun deposit(token: @{NonFungibleToken.NFT}) {
            let token <- token as! @DisneyPinnacleNFT.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            destroy oldToken
        }

        /// forEachID iterates through the IDs of the collection
        access(all) fun forEachID(_ f: fun (UInt64): Bool): Void {
            for id in self.ownedNFTs.keys {
                if !f(id) {
                    break
                }
            }
        }
    }

    /// createEmptyCollection creates an empty Collection for DisneyPinnacleNFT NFTs
    access(all) fun createEmptyCollection(nftType: Type): @{NonFungibleToken.Collection} {
        return <-create Collection()
    }

    /// Minter Resource
    access(all) resource NFTMinter {
        /// mintNFT mints a new NFT with a given badge type
        access(all) fun mintNFT(recipient: &{NonFungibleToken.Collection}, badgeType: BadgeType) {
            let metadata = DisneyPinnacleNFT.getBadgeMetadata(badgeType)
            let newNFT <- create NFT(badgeType: badgeType)
            
            emit Minted(
                id: newNFT.id,
                uuid: newNFT.uuid,
                name: metadata["name"] ?? "Disney Badge",
                description: metadata["description"] ?? "A Disney collectible badge",
                badgeType: badgeType.rawValue.toString(),
                recipient: recipient.owner?.address
            )
            
            recipient.deposit(token: <-newNFT)
        }
    }

    /// getRandomBadgeType returns a random badge type using onchain data
    access(all) fun getRandomBadgeType(): BadgeType {
        let blockHeight = getCurrentBlock().height
        let timestamp = UInt64(getCurrentBlock().timestamp)
        let randomSeed = blockHeight + timestamp
        let badgeIndex = randomSeed % 5
        
        switch badgeIndex {
            case 0: return BadgeType.mickey
            case 1: return BadgeType.minnie
            case 2: return BadgeType.donald
            case 3: return BadgeType.goofy
            case 4: return BadgeType.castle
            default: return BadgeType.mickey
        }
    }

    /// Contract-level view functions
    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<MetadataViews.NFTCollectionData>(),
            Type<MetadataViews.NFTCollectionDisplay>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<MetadataViews.NFTCollectionData>():
                let collectionData = MetadataViews.NFTCollectionData(
                    storagePath: self.CollectionStoragePath,
                    publicPath: self.CollectionPublicPath,
                    publicCollection: Type<&DisneyPinnacleNFT.Collection>(),
                    publicLinkedType: Type<&DisneyPinnacleNFT.Collection>(),
                    createEmptyCollectionFunction: (fun(): @{NonFungibleToken.Collection} {
                        return <-DisneyPinnacleNFT.createEmptyCollection(nftType: Type<@DisneyPinnacleNFT.NFT>())
                    })
                )
                return collectionData
            case Type<MetadataViews.NFTCollectionDisplay>():
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(
                        url: "https://disneypinnacle.com/logo.png"
                    ),
                    mediaType: "image/png"
                )
                return MetadataViews.NFTCollectionDisplay(
                    name: "Disney Pinnacle Badges",
                    description: "Collectible Disney pin badges on Flow blockchain",
                    externalURL: MetadataViews.ExternalURL("https://disneypinnacle.com"),
                    squareImage: media,
                    bannerImage: media,
                    socials: {}
                )
        }
        return nil
    }

    init() {
        // Set the named paths
        self.CollectionStoragePath = /storage/DisneyPinnacleNFTCollection
        self.CollectionPublicPath = /public/DisneyPinnacleNFTCollection
        self.MinterStoragePath = /storage/DisneyPinnacleNFTMinter

        // Create a Collection resource and save it to storage
        let collection <- create Collection()
        self.account.storage.save(<-collection, to: self.CollectionStoragePath)

        // Create a public capability for the collection
        let collectionCap = self.account.capabilities.storage.issue<&DisneyPinnacleNFT.Collection>(
            self.CollectionStoragePath
        )
        self.account.capabilities.publish(collectionCap, at: self.CollectionPublicPath)

        // Create a Minter resource and save it to storage
        let minter <- create NFTMinter()
        self.account.storage.save(<-minter, to: self.MinterStoragePath)
    }
}