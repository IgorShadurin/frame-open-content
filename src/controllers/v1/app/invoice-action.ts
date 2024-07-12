import { Request, Response, NextFunction } from 'express'
import { IInvoiceResponse } from './interface/IInvoiceResponse'
import { insertInvoice, getInvoicedItem } from '../../../db/invoice'
import { encodeBase } from '../../../utils/encoder'
import { getContentItem } from '../../../db/content'
import { IInvoiceRequest } from './interface/IInvoiceRequest'
import { getUserByFid, upsertUser } from '../../../db/user'
import { getUserParams } from './utils/user'

/**
 * The method creates a unique invoice number and specifies it in the transaction amount. The invoice number is unique for each seller. A seller can have up to 99,999 invoices. The invoice number is embedded in the transaction amount, such as USDC 1.099999. The limitation on the number of invoices is due to the restriction on the number of decimal places allowed in USDC.
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
    // const isOwn = await isItemPurchased(sellerFid, itemId, fid)
    const invoicedItem = await getInvoicedItem(sellerFid, itemId, fid)
    const contentItem = await getContentItem(sellerFid, itemId)

    if (!contentItem) {
      throw new Error(`Content item not found: sellerFid: ${sellerFid}, itemId: ${itemId}`)
    }

    const seller = await getUserByFid(sellerFid)

    if (!seller) {
      throw new Error(`Seller not found: sellerFid: ${sellerFid}`)
    }

    let invoiceId: number

    if (!invoicedItem) {
      invoiceId = await insertInvoice({
        seller_fid: sellerFid,
        item_id: itemId,
        buyer_fid: fid,
        is_paid: false,
      })
    } else {
      invoiceId = invoicedItem.invoice_id
    }

    const result: IInvoiceResponse = {
      status: 'ok',
      sellerFid,
      buyerFid: fid,
      itemId,
      isOwn: Boolean(invoicedItem?.is_paid),
      invoiceId,
      priceRaw: contentItem.price,
      sellerWallet: seller.main_eth_address,
      price: encodeBase(Number(contentItem.price), invoiceId),
    }

    res.json(result)
  } catch (e) {
    next(e)
  }
}
