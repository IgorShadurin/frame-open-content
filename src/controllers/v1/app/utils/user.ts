import { Request } from 'express'
import { IIsOwnRequest } from '../interface/IIsOwnRequest'
import { getConfigData } from '../../../../config'
import { getInteractorInfo } from '../../../../utils/farcaster'
import { ICreateItemRequest } from '../interface/ICreateItemRequest'
import { decodeBase, encodeBase } from '../../../../utils/encoder'
import { ActionState, IComposerAction, isComposerAction } from '../interface/IComposerAction'
import { safeJsonParse } from '../../../../utils/json'
import { getSessionInfo } from '../../../../utils/clicks'
import { getUserByFid } from '../../../../db/user'

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

  const { clickData, sessionId, contentType, contentData, price } = req.body
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

  if (clickData) {
    if (typeof clickData !== 'string') {
      throw new Error('Invalid clickData')
    }
  } else if (sessionId) {
    if (typeof sessionId !== 'string') {
      throw new Error('Invalid sessionId')
    }
  } else {
    throw new Error('Empty clickData or sessionId')
  }

  try {
    let response

    if (clickData) {
      response = await getInteractorInfo(neynarApiKey, clickData)
    } else if (sessionId) {
      const fid = await getSessionInfo(sessionId)
      const user = await getUserByFid(fid)

      if (!user) {
        throw new Error(`User not found: ${fid}`)
      }
      response = {
        fid,
        custodyAddress: user.main_eth_address,
      }
    } else {
      throw new Error('Empty handle clickData or sessionId')
    }

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

export async function getOpenParams(
  req: Request<IComposerAction>,
): Promise<{ fid: number; ethAddress: string; text: string }> {
  if (!isComposerAction(req.body)) {
    throw new Error('Invalid composer action')
  }
  const action = req.body as IComposerAction
  const actionState = safeJsonParse(
    decodeURIComponent(action.untrustedData.state),
    'Can not decode action state',
  ) as ActionState
  const { neynarApiKey } = getConfigData()

  try {
    const response = await getInteractorInfo(neynarApiKey, action.trustedData.messageBytes)

    return {
      fid: Number(response.fid),
      ethAddress: response.custodyAddress,
      text: actionState.cast.text,
    }
  } catch (e) {
    throw new Error(`External provider cannot handle the click data: ${(e as Error).message}`)
  }
}
