import { db } from './index'

export const PURCHASE_TABLE_NAME = 'purchase'

export interface IPurchase {
  id?: number
  buyer_fid: number
  seller_fid: number
  item_id: number
  tx_id: string
  created_at?: string
  updated_at?: string
}

export async function insertPurchase(purchaseData: Omit<IPurchase, 'created_at' | 'updated_at'>): Promise<void> {
  const date = db.fn.now()
  const newItem = { ...purchaseData, created_at: date, updated_at: date }

  await db(PURCHASE_TABLE_NAME).insert(newItem)
}

export async function purchaseCount(): Promise<number> {
  const count = await db(PURCHASE_TABLE_NAME).count('* as count').first()

  return Number(count?.count || 0)
}

export async function isItemPurchased(sellerFid: number, itemId: number, buyerFid: number): Promise<boolean> {
  const count = await db(PURCHASE_TABLE_NAME)
    .where({
      seller_fid: sellerFid,
      item_id: itemId,
      buyer_fid: buyerFid,
    })
    .count('* as count')
    .first()

  return Number(count?.count || 0) > 0
}
