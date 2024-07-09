import { db } from './index'

export const USER_TABLE_NAME = 'user'

export interface IUser {
  fid: number
  main_eth_address: string
  created_at?: string
  updated_at?: string
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
