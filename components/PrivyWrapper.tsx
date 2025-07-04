'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import ClientOnly from './ClientOnly'

export default function PrivyWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientOnly>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          loginMethods: ['email', 'google'],
          appearance: {
            theme: 'dark',
            accentColor: '#0066cc',
            logo: '/pinnacle-logo.png',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        {children}
      </PrivyProvider>
    </ClientOnly>
  )
}