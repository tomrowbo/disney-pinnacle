'use client'

import { useEffect } from 'react'
import * as fcl from '@onflow/fcl'
import ClientOnly from './ClientOnly'
import flowJSON from '../flow.json'

// Configure FCL properly for Flow testnet using flow.json
fcl.config({
  'flow.network': 'testnet',
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'Disney Pinnacle',
  'app.detail.icon': '/pinnacle-logo.png',
  'app.detail.description': 'Collect and trade Disney digital pins on Flow blockchain',
  'app.detail.url': 'https://disneypinnacle.com',
  'fcl.limit': 1000,
  // TODO: Add your WalletConnect Project ID here
  'walletconnect.projectId': '78b98078fd192d62329f183d717c2504',
  'walletconnect.disableNotifications': false
}).load({ flowJSON })

export default function FlowWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Additional FCL configuration if needed
  }, [])

  return (
    <ClientOnly>
      {children}
    </ClientOnly>
  )
}