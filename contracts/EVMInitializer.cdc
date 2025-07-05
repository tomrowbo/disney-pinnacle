/*
 * EVM Initializer for Disney Pinnacle NFTs
 * This contract helps initialize EVM addresses on Flow and set up collections
 */

import DisneyPinnacleNFT from 0xbb73690b2ec0ea5a
import NonFungibleToken from 0x631e88ae7f1d7c20
import FlowToken from 0x7e60df042a9c0868
import FungibleToken from 0x9a0766d93b6608b7

access(all) contract EVMInitializer {

    /// Initialize an EVM address on Flow by funding it and setting up collections
    access(all) fun initializeEVMAddress(
        evmAddress: Address,
        fundingAmount: UFix64,
        adminAccount: auth(BorrowValue) &Account
    ): Bool {
        
        // Get the target account (this will create it if it doesn't exist)
        let targetAccount = getAccount(evmAddress)
        
        // Check if account already has FLOW tokens
        if let flowReceiver = targetAccount.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver) {
            // Account exists and can receive FLOW
            
            // Fund the account if needed
            if fundingAmount > 0.0 {
                let flowVault = adminAccount.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
                    ?? panic("Could not borrow admin's flow vault")
                
                let fundingVault <- flowVault.withdraw(amount: fundingAmount)
                flowReceiver.deposit(from: <-fundingVault)
            }
            
            return true
        }
        
        return false
    }
    
    /// Check if an address has a Disney NFT collection
    access(all) fun hasNFTCollection(address: Address): Bool {
        let account = getAccount(address)
        return account.capabilities.borrow<&{NonFungibleToken.Collection}>(DisneyPinnacleNFT.CollectionPublicPath) != nil
    }
}