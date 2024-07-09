import { Request, Response, NextFunction } from 'express'
import { getConfigData } from '../../../config'
import { IInvoiceResponse } from './interface/IInvoiceResponse'
import { getInvoiceId, insertInvoice } from '../../../db/invoice'
import { encodeBase } from '../../../utils/encoder'
import { getContentItem } from '../../../db/content'
import { isItemPurchased } from '../../../db/purchase'
import { IInvoiceRequest } from './interface/IInvoiceRequest'
import { getInteractorInfo } from '../../../utils/farcaster'

function isIntegerString(str: unknown): boolean {
  const intRegex = /^-?\d+$/

  return intRegex.test(str as string)
}

export async function getInvoiceParams(
  req: Request<IInvoiceRequest>,
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

  return { fid, itemId: Number(itemId), sellerFid: Number(sellerFid) }
}

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
    const { sellerFid, itemId, fid } = await getInvoiceParams(req)

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
