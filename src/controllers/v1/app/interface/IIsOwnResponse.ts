export interface IIsOwnResponse {
  status: string
  sellerFid: number
  fid: number
  itemId: number
  isOwn: boolean
  contentType?: string
  content?: string
}
