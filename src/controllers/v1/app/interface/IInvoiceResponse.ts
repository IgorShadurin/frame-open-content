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
}
