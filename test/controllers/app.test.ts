import knex from 'knex'
import configurations from '../../knexfile'
import { db } from '../../src/db'
import { getInteractorInfo, InteractorInfo } from '../../src/utils/farcaster'
import app from '../../src/app'
import supertest from 'supertest'
import { getConfigData, setConfigData } from '../../src/config'
import { IInvoiceRequest } from '../../src/controllers/v1/app/interface/IInvoiceRequest'
import { upsertUser } from '../../src/db/user'
import { insertContent } from '../../src/db/content'
import { IIsOwnRequest } from '../../src/controllers/v1/app/interface/IIsOwnRequest'
import { insertPurchase } from '../../src/db/purchase'
import { ICreateItemRequest } from '../../src/controllers/v1/app/interface/ICreateItemRequest'

const testDb = knex(configurations.development)

jest.mock('../../src/utils/frame', () => {
  const originalModule = jest.requireActual('../../src/utils/frame')

  return {
    ...originalModule,
    validateFrameUrl: jest.fn().mockResolvedValue({}),
  }
})

jest.mock('../../src/utils/farcaster', () => {
  const originalModule = jest.requireActual('../../src/utils/farcaster')

  return {
    ...originalModule,
    getInteractorInfo: jest.fn().mockResolvedValue({}),
  }
})

const getInteractorInfoMock = getInteractorInfo as jest.Mock

function mockInteractorFunc(func: (neynarApiKey: string, clickData: string) => InteractorInfo) {
  getInteractorInfoMock.mockImplementation(func)
}

function mockInputData(fid: number, authorizedFrameUrl: string, custodyAddress: string) {
  mockInteractorFunc((neynarApiKey: string, clickData: string) => {
    return {
      isValid: true,
      fid,
      username: '',
      display_name: '',
      pfp_url: '',
      inputValue: '',
      url: authorizedFrameUrl,
      timestamp: new Date().toISOString(),
      custodyAddress,
    }
  })
}

describe('App', () => {
  const supertestApp = supertest(app)

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

  it('should create invoice', async () => {
    const sellerFid = 1
    const buyerFid1 = 2
    const buyerFid2 = 3
    const sellerFidAddress = '000'
    const buyerFid1Address = '111'
    const buyerFid2Address = '222'
    await upsertUser({ fid: sellerFid, main_eth_address: sellerFidAddress })
    await insertContent({
      user_fid: sellerFid,
      data_type: 'text',
      data_content: 'hello1',
      price: '11.1',
    })

    const postData: IInvoiceRequest = {
      sellerFid,
      itemId: 1,
      clickData: 'clickData1',
    }
    const authorizedFrameUrl = 'https://auth-frame.com'
    setConfigData({
      ...getConfigData(),
      authorizedFrameUrl,
    })
    mockInputData(buyerFid1, authorizedFrameUrl, buyerFid1Address)

    const response1 = {
      status: 'ok',
      invoiceId: 1,
      buyerFid: buyerFid1,
      isOwn: false,
      itemId: 1,
      sellerFid,
      price: '11.100001',
    }

    // response for the second buyer
    const response2 = { ...response1, invoiceId: 2, buyerFid: buyerFid2, price: '11.100002' }
    const data = (await supertestApp.post(`/v1/app/invoice`).send(postData)).body
    expect(data).toEqual(response1)

    // try to get an invoice for the same item
    const data1 = (await supertestApp.post(`/v1/app/invoice`).send(postData)).body
    expect(data1).toEqual(response1)

    // mock another buyer
    mockInputData(buyerFid2, authorizedFrameUrl, buyerFid2Address)
    const data2 = (await supertestApp.post(`/v1/app/invoice`).send(postData)).body
    expect(data2).toEqual(response2)

    // try to get an invoice for the same item
    const data3 = (await supertestApp.post(`/v1/app/invoice`).send(postData)).body
    expect(data3).toEqual(response2)
  })

  it('should buy item', async () => {
    const sellerFid = 1
    const buyerFid1 = 2
    const buyerFid2 = 3
    const sellerFidAddress = '000'
    const buyerFid1Address = '111'
    const buyerFid2Address = '222'
    await upsertUser({ fid: sellerFid, main_eth_address: sellerFidAddress })
    const contentItem = {
      user_fid: sellerFid,
      data_type: 'text',
      data_content: 'hello1',
      price: '11.1',
    }
    await insertContent(contentItem)

    const invoiceData: IInvoiceRequest = {
      sellerFid,
      itemId: 1,
      clickData: 'clickData1',
    }
    const isOwnData: IIsOwnRequest = {
      sellerFid,
      itemId: 1,
      clickData: 'clickData2',
    }

    const authorizedFrameUrl = 'https://auth-frame.com'
    setConfigData({
      ...getConfigData(),
      authorizedFrameUrl,
    })

    const response1 = {
      status: 'ok',
      invoiceId: 1,
      buyerFid: buyerFid1,
      isOwn: false,
      itemId: 1,
      sellerFid,
      price: '11.100001',
    }
    // response for the second buyer
    const response2 = { ...response1, invoiceId: 2, buyerFid: buyerFid2, price: '11.100002' }
    mockInputData(buyerFid1, authorizedFrameUrl, buyerFid1Address)
    expect((await supertestApp.post(`/v1/app/is-own`).send(isOwnData)).body).toEqual({
      status: 'ok',
      fid: buyerFid1,
      isOwn: false,
      itemId: 1,
      sellerFid,
    })

    const data = (await supertestApp.post(`/v1/app/invoice`).send(invoiceData)).body
    expect(data).toEqual(response1)
    // check that creation of an invoice is not changed the status of owning
    expect((await supertestApp.post(`/v1/app/is-own`).send(isOwnData)).body).toEqual({
      status: 'ok',
      fid: buyerFid1,
      isOwn: false,
      itemId: 1,
      sellerFid,
    })

    await insertPurchase({
      buyer_fid: buyerFid1,
      seller_fid: sellerFid,
      item_id: 1,
      tx_id: 'tx1',
    })

    // check that the status of owning is changed after the purchase
    expect((await supertestApp.post(`/v1/app/is-own`).send(isOwnData)).body).toEqual({
      status: 'ok',
      fid: buyerFid1,
      isOwn: true,
      itemId: 1,
      sellerFid,
      content: contentItem.data_content,
      contentType: contentItem.data_type,
    })

    // mock another buyer
    mockInputData(buyerFid2, authorizedFrameUrl, buyerFid2Address)
    const data2 = (await supertestApp.post(`/v1/app/invoice`).send(invoiceData)).body
    expect(data2).toEqual(response2)
    expect((await supertestApp.post(`/v1/app/is-own`).send(isOwnData)).body).toEqual({
      status: 'ok',
      fid: buyerFid2,
      isOwn: false,
      itemId: 1,
      sellerFid,
    })

    await insertPurchase({
      buyer_fid: buyerFid2,
      seller_fid: sellerFid,
      item_id: 1,
      tx_id: 'tx2',
    })
    expect((await supertestApp.post(`/v1/app/is-own`).send(isOwnData)).body).toEqual({
      status: 'ok',
      fid: buyerFid2,
      isOwn: true,
      itemId: 1,
      sellerFid,
      content: contentItem.data_content,
      contentType: contentItem.data_type,
    })
  })

  it('should create item', async () => {
    const sellerFid = 1
    const sellerFidAddress = '000'
    const buyerFid1 = 2
    const buyerFid1Address = '111'

    const contentItem: ICreateItemRequest = {
      contentType: 'text',
      contentData: 'hello1',
      price: '11.1',
      clickData: 'clickData1',
    }
    const contentItem2: ICreateItemRequest = {
      contentType: 'text',
      contentData: 'hello1',
      price: '1',
      clickData: 'clickData1',
    }

    const authorizedFrameUrl = 'https://auth-frame.com'
    setConfigData({
      ...getConfigData(),
      authorizedFrameUrl,
    })

    mockInputData(sellerFid, authorizedFrameUrl, sellerFidAddress)
    expect((await supertestApp.post(`/v1/app/create-item`).send(contentItem)).body).toEqual({
      status: 'ok',
      itemId: 1,
    })
    expect((await supertestApp.post(`/v1/app/create-item`).send(contentItem)).body).toEqual({
      status: 'ok',
      itemId: 2,
    })
    expect((await supertestApp.post(`/v1/app/create-item`).send(contentItem2)).body).toEqual({
      status: 'ok',
      itemId: 3,
    })

    mockInputData(buyerFid1, authorizedFrameUrl, buyerFid1Address)
    const expected1 = {
      status: 'ok',
      sellerFid,
      buyerFid: buyerFid1,
      invoiceId: 1,
      isOwn: false,
      itemId: 3,
      price: '1.000001',
    }
    expect(
      (await supertestApp.post(`/v1/app/invoice`).send({ sellerFid, itemId: 3, clickData: 'clickData1' })).body,
    ).toEqual(expected1)
    // check that new invoice is not created for the same item
    expect(
      (await supertestApp.post(`/v1/app/invoice`).send({ sellerFid, itemId: 3, clickData: 'clickData1' })).body,
    ).toEqual(expected1)

    const expected2 = {
      status: 'ok',
      sellerFid,
      buyerFid: buyerFid1,
      invoiceId: 2,
      isOwn: false,
      itemId: 2,
      price: '11.100002',
    }
    expect(
      (await supertestApp.post(`/v1/app/invoice`).send({ sellerFid, itemId: 2, clickData: 'clickData1' })).body,
    ).toEqual(expected2)
    expect(
      (await supertestApp.post(`/v1/app/invoice`).send({ sellerFid, itemId: 2, clickData: 'clickData1' })).body,
    ).toEqual(expected2)

    const expected3 = {
      status: 'ok',
      sellerFid,
      buyerFid: buyerFid1,
      invoiceId: 3,
      isOwn: false,
      itemId: 1,
      price: '11.100003',
    }
    expect(
      (await supertestApp.post(`/v1/app/invoice`).send({ sellerFid, itemId: 1, clickData: 'clickData1' })).body,
    ).toEqual(expected3)
    expect(
      (await supertestApp.post(`/v1/app/invoice`).send({ sellerFid, itemId: 1, clickData: 'clickData1' })).body,
    ).toEqual(expected3)
  })
})
