const baseUrl = process.env.API_URL

if (!baseUrl) {
  throw new Error('API_URL is not defined')
}

export interface IIsOwnResponse {
  status: string
  sellerFid: number
  fid: number
  itemId: number
  isOwn: boolean
  contentType?: string
  content?: string
}

export interface IInvoiceResponse {
  status: string
  sellerFid: number
  buyerFid: number
  itemId: number
  isOwn: boolean
  price: string
  priceRaw: string
  sellerWallet: string
  invoiceId: number
  contentType: string
  content?: string
  // in case of error
  message?: string
}

function getUrl(url: string): string {
  return new URL(url, baseUrl).toString()
}

/**
 * Get the auth data.
 * @param sellerFid Seller FID
 * @param itemId Item ID
 * @param clickData Click data
 */
export async function getIsOwn(sellerFid: number, itemId: number, clickData: string): Promise<IIsOwnResponse> {
  const url = getUrl(`v1/app/is-own?rand=${Math.random()}`)
  const req = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sellerFid, itemId, clickData }),
  })

  return req.json()
}

export async function getInvoice(sellerFid: number, itemId: number, clickData: string): Promise<IInvoiceResponse> {
  const url = getUrl(`v1/app/invoice?rand=${Math.random()}`)
  const req = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sellerFid, itemId, clickData }),
  })

  return req.json()
}
