import { serveStatic } from '@hono/node-server/serve-static'
import { Button, FrameContext, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { createSystem } from 'frog/ui'
import 'dotenv/config'
import { getInvoice, IInvoiceResponse } from './api.ts'
import { parseUnits } from 'ethers'

const BORDER = '1em solid grey'
const SELL_URL = 'https://open.web4.build/?clickData='
const TITLE = 'Open Content'

function renderError(c: FrameContext<{ State: State }>, e: unknown) {
  return c.res({
    title: TITLE,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER}>
        <VStack gap="4">
          <Heading color="fcPurple" align="center" size="48">
            Error
          </Heading>

          <Text align="center" size="18">
            {(e as Error).message}
          </Text>
        </VStack>
      </Box>
    ),
    intents: [<Button action="/">🏠 Home</Button>],
  })
}

export const { Box, Heading, Text, VStack, vars } = createSystem({
  colors: {
    white: 'white',
    black: 'black',
    fcPurple: 'rgb(138, 99, 210)',
    blue500: '#cbe7ff',
  },
  fonts: {
    default: [
      {
        name: 'Inter',
        source: 'google',
        weight: 400,
      },
      {
        name: 'Inter',
        source: 'google',
        weight: 600,
      },
    ],
  },
})

interface State {
  registerAppSession: string
  authAnswer: number
}

export const app = new Frog<{ State: State }>({
  initialState: {
    registerAppSession: '',
    authAnswer: 0,
  },
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  basePath: '/',
  ui: { vars },
})

app.use('/*', serveStatic({ root: './public' }))
app.frame('/', async c => {
  return c.res({
    title: TITLE,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER}>
        <VStack gap="4">
          <Heading color="fcPurple" align="center" size="48">
            Oops!
          </Heading>

          <Text align="center" size="18">
            Please use the link provided by the content creator to access the content.
          </Text>
        </VStack>
      </Box>
    ),
    intents: [<Button action="/">🏠 Home</Button>],
  })
})

app.frame('/open/:price/:sellerFid/:itemId', async c => {
  try {
    const { price, sellerFid, itemId } = c.req.param()
    const animation = '/animation/2.gif'

    if (!price || isNaN(Number(price))) {
      throw new Error('Price is not defined')
    }

    if (!sellerFid || isNaN(Number(sellerFid))) {
      throw new Error('sellerFid is not defined')
    }

    if (!itemId || isNaN(Number(itemId))) {
      throw new Error('itemId is not defined')
    }

    return c.res({
      title: TITLE,
      imageAspectRatio: '1:1',
      image: animation,
      intents: [<Button action={`/unlock/${sellerFid}/${itemId}`}>⭐ Unlock for ${price}</Button>],
    })
  } catch (e) {
    return renderError(c, e)
  }
})

app.frame('/unlock/:sellerFid/:itemId', async c => {
  try {
    const { sellerFid, itemId } = c.req.param()
    const sellerFidNumber = Number(sellerFid)
    const itemIdNumber = Number(itemId)

    if (!sellerFid || isNaN(sellerFidNumber)) {
      throw new Error('sellerFid is not defined')
    }

    if (!itemId || isNaN(itemIdNumber)) {
      throw new Error('itemId is not defined')
    }

    let invoiceData: IInvoiceResponse | undefined
    let bytes
    try {
      const {
        trustedData: { messageBytes },
      } = await c.req.json()

      invoiceData = await getInvoice(sellerFidNumber, itemIdNumber, messageBytes)
      bytes = messageBytes
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('/unlock method', (e as Error).message)
    }

    if (!invoiceData || invoiceData.status !== 'ok') {
      throw new Error(invoiceData?.message ?? 'Invoice data is not found')
    }

    const isBought = invoiceData.isOwn
    let intents: unknown[] = []

    if (!isBought) {
      intents = [
        <Button.Transaction
          action={`/unlock/${sellerFid}/${itemId}`}
          target={`/buy/${invoiceData.price}/0x${invoiceData.sellerWallet}`}
        >
          🛒 Buy
        </Button.Transaction>,
      ]
    }

    intents.push(
      <Button value={c.buttonValue} action={`/unlock/${sellerFid}/${itemIdNumber}`}>
        🔄️ Refresh
      </Button>,
      <Button.Link href={`${SELL_URL}${bytes}`}>💰 Sell</Button.Link>,
    )

    let content = (
      <VStack gap="6">
        <Heading color="white" align="center" size="48">
          Content Purchase
        </Heading>

        <Text size="32" align="center" color="white" weight="800">
          <span style={{ marginTop: 50 }}>
            <img src="/usdc.png" alt="USDC" width={70} style={{ marginRight: 15 }} /> ~{invoiceData.priceRaw}
          </span>
        </Text>

        <Text size="12" color="white" align="center">
          <span style={{ marginTop: 100 }}>After payment, the content will be available to you within ~1 minute.</span>
        </Text>
      </VStack>
    )

    if (isBought) {
      content = (
        <VStack gap="6">
          <Heading color="white" align="center" size="24">
            Purchased Content
          </Heading>

          <Text size="20" color="white" align="center">
            {invoiceData.content}
          </Text>
        </VStack>
      )
    }

    return c.res({
      title: TITLE,
      imageAspectRatio: '1.91:1',
      image: (
        <Box grow alignVertical="center" backgroundColor="black" padding="32" border={BORDER}>
          {content}
        </Box>
      ),
      intents,
    })
  } catch (e) {
    return renderError(c, e)
  }
})

app.transaction('/buy/:price/:to', c => {
  const price = c.req.param('price')
  const to = c.req.param('to')
  const abi = [
    {
      constant: false,
      inputs: [
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      type: 'function',
    },
  ]

  return c.contract({
    abi,
    chainId: 'eip155:8453',
    functionName: 'transfer',
    args: [to, parseUnits(price, 6)],
    // USDC on Base contract address
    to: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    value: 0n,
  })
})

if (process.env.ENV === 'development') {
  devtools(app, { serveStatic })
}
