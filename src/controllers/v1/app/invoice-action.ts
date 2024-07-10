import { Request, Response, NextFunction } from 'express'
import { IInvoiceResponse } from './interface/IInvoiceResponse'
import { getInvoiceId, insertInvoice } from '../../../db/invoice'
import { encodeBase } from '../../../utils/encoder'
import { getContentItem } from '../../../db/content'
import { isItemPurchased } from '../../../db/purchase'
import { IInvoiceRequest } from './interface/IInvoiceRequest'
import { upsertUser } from '../../../db/user'
import { getUserParams } from './utils/user'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (
  req: Request<IInvoiceRequest>,
  res: Response<IInvoiceResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { sellerFid, itemId, fid, ethAddress } = await getUserParams(req)

    await upsertUser({ fid, main_eth_address: ethAddress })
    const isOwn = await isItemPurchased(sellerFid, itemId, fid)
    let invoiceId = await getInvoiceId(sellerFid, itemId, fid)
    const contentItem = await getContentItem(sellerFid, itemId)

    if (!contentItem) {
      throw new Error(`Content item not found: sellerFid: ${sellerFid}, itemId: ${itemId}`)
    }

    if (!invoiceId) {
      invoiceId = await insertInvoice({
        seller_fid: sellerFid,
        item_id: itemId,
        buyer_fid: fid,
      })
    }

    const result: IInvoiceResponse = {
      status: 'ok',
      sellerFid,
      buyerFid: fid,
      itemId,
      isOwn,
      invoiceId,
      price: encodeBase(Number(contentItem.price), invoiceId),
    }

    res.json(result)
  } catch (e) {
    next(e)
  }
}
