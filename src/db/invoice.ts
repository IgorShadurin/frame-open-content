import { db } from './index'

export const INVOICE_TABLE_NAME = 'invoice'

export interface IInvoice {
  buyer_fid: number
  seller_fid: number
  item_id: number
  /**
   * Unique invoice id for [seller_fid, item_id]
   */
  invoice_id: number
  created_at?: string
  updated_at?: string
}

export async function getNextInvoiceId(sellerFid: number, itemId: number): Promise<number> {
  const maxInvoiceId = await db(INVOICE_TABLE_NAME)
    .where({
      seller_fid: sellerFid,
      item_id: itemId,
    })
    .max('invoice_id as max')
    .first()

  return Number(maxInvoiceId?.max || 0) + 1
}

export async function insertInvoice(
  invoiceData: Omit<IInvoice, 'created_at' | 'updated_at' | 'invoice_id'>,
): Promise<number> {
  const date = db.fn.now()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newItem: IInvoice = { ...invoiceData, created_at: date, updated_at: date }
  newItem.invoice_id = await getNextInvoiceId(invoiceData.seller_fid, invoiceData.item_id)
  await db(INVOICE_TABLE_NAME).insert(newItem)

  return newItem.invoice_id
}

export async function invoiceCount(): Promise<number> {
  const count = await db(INVOICE_TABLE_NAME).count('* as count').first()

  return Number(count?.count || 0)
}

export async function getInvoiceId(sellerFid: number, itemId: number, buyerFid: number): Promise<number | null> {
  const invoice = await db(INVOICE_TABLE_NAME)
    .where({
      seller_fid: sellerFid,
      item_id: itemId,
      buyer_fid: buyerFid,
    })
    .select('invoice_id')
    .first()

  return invoice?.invoice_id || null
}

export async function isItemInvoiced(sellerFid: number, itemId: number, buyerFid: number): Promise<boolean> {
  const count = await db(INVOICE_TABLE_NAME)
    .where({
      seller_fid: sellerFid,
      item_id: itemId,
      buyer_fid: buyerFid,
    })
    .count('* as count')
    .first()

  return Number(count?.count || 0) > 0
}
