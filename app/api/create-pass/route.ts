import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, userEmail } = await request.json()
    
    console.log('Getting or creating pass for wallet:', walletAddress)
    console.log('User email:', userEmail)
    console.log('Template ID:', process.env.PASSENTRY_TEMPLATE_ID)
    
    if (!walletAddress) {
      console.error('No wallet address provided')
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // First, try to get existing pass by extId
    const getUrl = `https://api.passentry.com/api/v1/passes/${walletAddress}`
    console.log('Checking for existing pass at:', getUrl)
    
    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PASSENTRY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Get response status:', getResponse.status)

    if (getResponse.ok) {
      const existingPasses = await getResponse.json()
      console.log('Existing passes response:', existingPasses)
      
      // Handle both array and object forms of 'data'
      if (existingPasses.data) {
        // If data is an array
        if (Array.isArray(existingPasses.data) && existingPasses.data.length > 0) {
          const existingPass = existingPasses.data[0]
          console.log('Found existing pass (array):', existingPass.id)
          return NextResponse.json({ 
            passUrl: existingPass.attributes.downloadUrl, 
            passId: existingPass.id,
            existing: true
          })
        }
        // If data is an object (single pass)
        else if (typeof existingPasses.data === 'object' && existingPasses.data.id) {
          const existingPass = existingPasses.data
          console.log('Found existing pass (object):', existingPass.id)
          return NextResponse.json({ 
            passUrl: existingPass.attributes.downloadUrl, 
            passId: existingPass.id,
            existing: true
          })
        }
      }
    }

    // If no existing pass found, create a new one
    console.log('No existing pass found, creating new pass')
    
    const passData = {
      pass: {
        nfc: {
          enabled: true,
          source: "custom",
          customValue: walletAddress
        },
        address: walletAddress,
        badges: 0
      },
      locations: []
    }

    console.log('Pass data being sent:', JSON.stringify(passData, null, 2))
    
    const createUrl = `https://api.passentry.com/api/v1/passes?passTemplate=${process.env.PASSENTRY_TEMPLATE_ID}&extId=${walletAddress}`
    console.log('Creating pass at:', createUrl)

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PASSENTRY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passData),
    })

    console.log('Create response status:', createResponse.status)
    console.log('Create response headers:', Object.fromEntries(createResponse.headers.entries()))

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('PassEntry create API error response:', errorText)
      console.error('PassEntry create API error status:', createResponse.status)
      console.error('PassEntry create API error status text:', createResponse.statusText)
      return NextResponse.json({ 
        error: 'Failed to create pass', 
        details: errorText,
        status: createResponse.status 
      }, { status: 500 })
    }

    const newPass = await createResponse.json()
    console.log('PassEntry create success response:', newPass)
    return NextResponse.json({ 
      passUrl: newPass.data.attributes.downloadUrl, 
      passId: newPass.data.id,
      existing: false
    })
    
  } catch (error) {
    console.error('Error in get-or-create pass:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}