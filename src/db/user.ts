import { db } from './index'

export const USER_TABLE_NAME = 'user'

export interface IUser {
  fid: number
  main_eth_address: string
  created_at?: string
  updated_at?: string
}

export async function getUserByFid(fid: number): Promise<IUser | undefined> {
  return db(USER_TABLE_NAME).where('fid', fid).first()
}

export async function getUserByEthAddress(ethAddress: string): Promise<IUser | undefined> {
  return db(USER_TABLE_NAME).where('main_eth_address', ethAddress).first()
}

export async function upsertUser(userData: Omit<IUser, 'created_at' | 'updated_at'>): Promise<void> {
  const date = db.fn.now()
  const newItem = { ...userData, updated_at: date }

  await db(USER_TABLE_NAME)
    .insert({ ...newItem, created_at: date })
    .onConflict('fid')
    .merge(newItem)
}

export async function userExists(fid: number): Promise<boolean> {
  const user = await db(USER_TABLE_NAME).where('fid', fid).first()

  return Boolean(user)
}

/**
 * Get the list of sellers that have at least 1 item to sell.
 */
export async function getActiveSellers(): Promise<{ [key: string]: number }> {
  const sellers = await db(USER_TABLE_NAME)
    .join('content', 'user.fid', 'content.user_fid')
    .distinct('user.main_eth_address', 'user.fid')
    .select('user.main_eth_address', 'user.fid')

  return sellers.reduce(
    (acc, { main_eth_address, fid }) => {
      acc[main_eth_address] = fid

      return acc
    },
    {} as { [key: string]: number },
  )
}

/**
 * Get the count of sellers that have at least 1 item to sell.
 */
export async function getActiveSellersCount(): Promise<number> {
  const result = await db(USER_TABLE_NAME)
    .join('content', 'user.fid', 'content.user_fid')
    .countDistinct('user.fid as count')
    .first()

  return Number(result?.count || 0)
}
