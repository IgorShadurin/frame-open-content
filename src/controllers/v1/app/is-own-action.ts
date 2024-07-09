import { Request, Response, NextFunction } from 'express'
import { IIsOwnResponse } from './interface/IIsOwnResponse'
import { getConfigData } from '../../../config'
import { isItemPurchased } from '../../../db/purchase'
import { getContentItem } from '../../../db/content'
import { IIsOwnRequest } from './interface/IIsOwnRequest'
import { getInteractorInfo } from '../../../utils/farcaster'

function isIntegerString(str: unknown): boolean {
  const intRegex = /^-?\d+$/

  return intRegex.test(str as string)
}

export async function getIsOwnParams(
  req: Request<IIsOwnRequest>,
): Promise<{ sellerFid: number; fid: number; itemId: number }> {
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

  let fid = 0
  try {
    const response = await getInteractorInfo(neynarApiKey, clickData)
    fid = response.fid
  } catch (e) {
    throw new Error(`External provider cannot handle the click data: ${(e as Error).message}`)
  }

  return { fid: Number(fid), itemId: Number(itemId), sellerFid: Number(sellerFid) }
}

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (
  req: Request<IIsOwnRequest>,
  res: Response<IIsOwnResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { sellerFid, itemId, fid } = await getIsOwnParams(req)
    const isOwn = await isItemPurchased(sellerFid, itemId, fid)
    const result: IIsOwnResponse = {
      status: 'ok',
      sellerFid,
      fid,
      itemId,
      isOwn: isOwn,
    }

    if (isOwn) {
      const itemInfo = await getContentItem(sellerFid, itemId)

      if (!itemInfo) {
        throw new Error(`Item not found: sellerFid: ${sellerFid}, itemId: ${itemId}`)
      }

      result.contentType = itemInfo.data_type
      result.content = itemInfo.data_content
    }
    res.json(result)
  } catch (e) {
    next(e)
  }
}
