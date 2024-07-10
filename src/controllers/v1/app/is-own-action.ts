import { Request, Response, NextFunction } from 'express'
import { IIsOwnResponse } from './interface/IIsOwnResponse'
import { isItemPurchased } from '../../../db/purchase'
import { getContentItem } from '../../../db/content'
import { IIsOwnRequest } from './interface/IIsOwnRequest'
import { upsertUser } from '../../../db/user'
import { getUserParams } from './utils/user'

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
    const { sellerFid, itemId, fid, ethAddress } = await getUserParams(req)
    await upsertUser({ fid, main_eth_address: ethAddress })
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
