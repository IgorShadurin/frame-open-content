import { db } from './index'

export const CONTENT_TABLE_NAME = 'content'

export interface IContent {
  item_id: number
  user_fid: number
  data_type: string
  data_content: string
  price: string
  created_at?: string
  updated_at?: string
}

export async function getNextItemId(userFid: number): Promise<number> {
  const maxItemId = await db(CONTENT_TABLE_NAME)
    .where({
      user_fid: userFid,
    })
    .max('item_id')
    .first()

  return Number(maxItemId?.max || 0) + 1
}

export async function insertContent(
  contentData: Omit<IContent, 'created_at' | 'updated_at' | 'item_id'>,
): Promise<number> {
  const date = db.fn.now()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newItem: IContent = { ...contentData, created_at: date, updated_at: date }
  newItem.item_id = await getNextItemId(contentData.user_fid)
  await db(CONTENT_TABLE_NAME).insert(newItem)

  return newItem.item_id
}

export async function contentCount(): Promise<number> {
  const count = await db(CONTENT_TABLE_NAME).count('* as count').first()

  return Number(count?.count || 0)
}

export async function userContentItems(userFid: number): Promise<IContent[]> {
  return db(CONTENT_TABLE_NAME).where({ user_fid: userFid })
}

export async function getContentItem(userFid: number, itemId: number): Promise<IContent | undefined> {
  return db(CONTENT_TABLE_NAME).where({ user_fid: userFid, item_id: itemId }).first()
}
