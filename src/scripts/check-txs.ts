import { ethers, id, formatUnits, Provider, Filter, Log } from 'ethers'
import fs from 'fs'
import path from 'path'
import { prepareEthAddress } from '../utils/eth'
import { getActiveSellers, getActiveSellersCount, getUserByEthAddress } from '../db/user'
import { decodeBase } from '../utils/encoder'
import { getInvoiceById, setInvoicePaid } from '../db/invoice'
import { getContentItem } from '../db/content'
import { loadConfig } from '../config'

loadConfig()

const usdcBaseAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'
const START_BLOCK = 16913050 // starting block if no state is saved
const STATE_FILE = path.resolve(__dirname, 'state.json')
const MAX_BLOCK_RANGE = 2000 // Maximum block range to fetch logs
let sellersList: { [key: string]: number } = {}

interface State {
  latestBlock: number
}

const logEnabled = false

function logMessage(message: string, ...optionalParams: unknown[]): void {
  if (logEnabled) {
    console.log(message, ...optionalParams) // eslint-disable-line no-console
  }
}

async function loadState(): Promise<State> {
  if (fs.existsSync(STATE_FILE)) {
    const data = fs.readFileSync(STATE_FILE, 'utf8')

    return JSON.parse(data)
  }

  return { latestBlock: START_BLOCK }
}

async function saveState(state: State): Promise<void> {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8')
}

async function fetchHistoricalEvents(
  provider: Provider,
  contract: ethers.Contract,
  filter: Filter,
  fromBlock: number,
  toBlock: number,
): Promise<void> {
  const logs = await provider.getLogs({ ...filter, fromBlock, toBlock })
  logs.forEach(log => {
    handleEvent(log, contract)
  })
}

async function handleEvent(eventLog: Log, contract: ethers.Contract): Promise<void> {
  try {
    const parsedLog = contract.interface.parseLog(eventLog)

    if (!parsedLog) {
      return
    }
    const { from, to, value } = parsedLog.args

    if (!sellersList[prepareEthAddress(to)]) {
      return
    }
    const amount = formatUnits(value, 6)
    logMessage(`Transfer from ${from} to ${to} of ${amount} USDC`)
    logMessage(JSON.stringify(eventLog))
    const decoded = decodeBase(amount)
    logMessage('Decoded:', decoded)
    const buyerUser = await getUserByEthAddress(prepareEthAddress(from))
    const sellerUser = await getUserByEthAddress(prepareEthAddress(to))

    if (!buyerUser || !sellerUser) {
      throw new Error(`Buyer or seller not found: ${from}, ${to}`)
    }

    const invoiceItem = await getInvoiceById(sellerUser.fid, decoded.invoiceId)

    if (!invoiceItem) {
      throw new Error(
        `Invoice item not found: sellerUser: ${sellerUser.fid}, invoiceId: ${decoded.invoiceId}, buyerUser: ${buyerUser.fid}`,
      )
    }

    if (invoiceItem.is_paid) {
      logMessage('Invoice already paid, skip it')

      return
    }

    const contentItem = await getContentItem(sellerUser.fid, invoiceItem.item_id)

    if (!contentItem) {
      throw new Error(`Content item not found: ${sellerUser.fid}, ${invoiceItem.item_id}`)
    }

    if (Number(amount) < Number(contentItem.price)) {
      throw new Error(`The amount is less than the price: ${amount}, ${contentItem.price}`)
    }
    await setInvoicePaid(sellerUser.fid, invoiceItem.invoice_id, true)
  } catch (e) {
    console.error('Error in handleEvent', e) // eslint-disable-line no-console
  }
}

async function start(): Promise<void> {
  logMessage('Starting...')
  const state = await loadState()
  const provider = new ethers.AlchemyProvider('base', 'rPbmLp211IR7wJvYvzvBfF9roILqI2f_')
  const usdcABI = ['event Transfer(address indexed from, address indexed to, uint256 value)']
  const usdcContract = new ethers.Contract(usdcBaseAddress, usdcABI, provider)
  sellersList = await getActiveSellers()
  logMessage('sellersList length', sellersList.length)
  setInterval(async () => {
    if ((await getActiveSellersCount()) > sellersList.length) {
      sellersList = await getActiveSellers()
      logMessage('The list of active sellers updated.')
    }
  }, 5000)

  const filter: Filter = {
    address: usdcBaseAddress,
    topics: [id('Transfer(address,address,uint256)')],
  }

  let fromBlock = state.latestBlock
  logMessage('fromBlock', fromBlock)
  let toBlock = await provider.getBlockNumber()

  while (fromBlock < toBlock) {
    const endBlock = Math.min(fromBlock + MAX_BLOCK_RANGE, toBlock)
    await fetchHistoricalEvents(provider, usdcContract, filter, fromBlock, endBlock)
    state.latestBlock = endBlock + 1
    await saveState(state)
    fromBlock = endBlock + 1
    toBlock = await provider.getBlockNumber()
  }

  // Subscribe to new events
  provider.on(filter, async (log: Log) => {
    await handleEvent(log, usdcContract)
    state.latestBlock = log.blockNumber + 1
    await saveState(state)
  })

  logMessage(`Listening for USDC transfers from block ${state.latestBlock}...`)
}

start().then()
