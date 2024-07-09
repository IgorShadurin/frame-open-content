export interface IInvoiceResponse {
  status: string
  sellerFid: number
  buyerFid: number
  itemId: number
  isOwn: boolean
  price: string
  invoiceId: number
}
