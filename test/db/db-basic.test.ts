import { db } from '../../src/db'
import { upsertUser, userExists } from '../../src/db/user'
import knex from 'knex'
import configurations from '../../knexfile'
import { contentCount, insertContent, userContentItems } from '../../src/db/content'
import { insertPurchase, isItemPurchased, purchaseCount } from '../../src/db/purchase'

describe('DB Basic', () => {
  const testDb = knex(configurations.development)

  beforeEach(async () => {
    // Rollback the migration (if any)
    await testDb.migrate.rollback()
    // Run the migration
    await testDb.migrate.latest()
  })

  afterEach(async () => {
    // After each test, we can rollback the migration
    await testDb.migrate.rollback()
  })

  afterAll(async () => {
    // to prevent tests freezing after execution
    await testDb.destroy()
    await db.destroy()
  })

  it('should add records', async () => {
    expect(await isItemPurchased(1, 1, 2)).toBeFalsy()
    expect(await userExists(1)).toBeFalsy()
    expect(await userExists(2)).toBeFalsy()
    expect(await contentCount()).toBe(0)
    expect(await purchaseCount()).toBe(0)
    expect(await userContentItems(1)).toHaveLength(0)

    await upsertUser({ fid: 1, main_eth_address: '111' })
    await upsertUser({ fid: 2, main_eth_address: '222' })
    await insertContent({ user_fid: 1, price: '1', data_type: 'text', data_content: 'hello1' })
    await insertContent({ user_fid: 1, price: '1.01', data_type: 'text', data_content: 'hello2' })
    await insertPurchase({ buyer_fid: 2, seller_fid: 1, item_id: 1, tx_id: '1' })

    expect(await isItemPurchased(1, 1, 2)).toBeTruthy()
    expect(await userExists(1)).toBeTruthy()
    expect(await userExists(2)).toBeTruthy()
    expect(await contentCount()).toBe(2)
    expect(await purchaseCount()).toBe(1)
    expect(await userContentItems(1)).toHaveLength(2)
  })
})
