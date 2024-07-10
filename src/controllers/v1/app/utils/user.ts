import { Request } from 'express'
import { IIsOwnRequest } from '../interface/IIsOwnRequest'
import { getConfigData } from '../../../../config'
import { getInteractorInfo } from '../../../../utils/farcaster'
import { ICreateItemRequest } from '../interface/ICreateItemRequest'
import { decodeBase, encodeBase } from '../../../../utils/encoder'

export function isIntegerString(str: unknown): boolean {
  const intRegex = /^-?\d+$/

  return intRegex.test(str as string)
}

export async function getUserParams(
  req: Request<IIsOwnRequest>,
): Promise<{ sellerFid: number; fid: number; itemId: number; ethAddress: string }> {
  const { neynarApiKey } = getConfigData()

  const { sellerFid, itemId, clickData } = req.body

  if (!sellerFid || !isIntegerString(sellerFid)) {
    throw new Error('Invalid sellerFid')
  }

  if (!itemId || !isIntegerString(itemId)) {
    throw new Error('Invalid itemId')
  }

  if (!clickData || typeof clickData !== 'string') {
    throw new Error('Invalid clickData')
  }

  try {
    const response = await getInteractorInfo(neynarApiKey, clickData)

    return {
      fid: Number(response.fid),
      itemId: Number(itemId),
      sellerFid: Number(sellerFid),
      ethAddress: response.custodyAddress,
    }
  } catch (e) {
    throw new Error(`External provider cannot handle the click data: ${(e as Error).message}`)
  }
}

export async function getSellerParams(
  req: Request<ICreateItemRequest>,
): Promise<{ fid: number; ethAddress: string; contentType: string; contentData: string; price: string }> {
  const { neynarApiKey } = getConfigData()

  const { clickData, contentType, contentData, price } = req.body
  const checkedPrice = decodeBase(encodeBase(Number(price), 1)).amount.toString()

  if (!price) {
    throw new Error('Invalid price')
  }

  if (!contentType || contentType !== 'text') {
    throw new Error('Invalid contentType')
  }

  if (!contentData || typeof contentData !== 'string') {
    throw new Error('Invalid contentData')
  }

  if (!clickData || typeof clickData !== 'string') {
    throw new Error('Invalid clickData')
  }

  try {
    const response = await getInteractorInfo(neynarApiKey, clickData)

    return {
      fid: Number(response.fid),
      ethAddress: response.custodyAddress,
      contentType,
      contentData,
      price: checkedPrice,
    }
  } catch (e) {
    throw new Error(`External provider cannot handle the click data: ${(e as Error).message}`)
  }
}
