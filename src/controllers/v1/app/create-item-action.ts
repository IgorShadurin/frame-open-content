import { Request, Response, NextFunction } from 'express'
import { insertContent } from '../../../db/content'
import { ICreateItemRequest } from './interface/ICreateItemRequest'
import { ICreateItemResponse } from './interface/ICreateItemResponse'
import { getSellerParams } from './utils/user'
import { upsertUser } from '../../../db/user'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (
  req: Request<ICreateItemRequest>,
  res: Response<ICreateItemResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { fid, ethAddress, contentType, contentData, price } = await getSellerParams(req)

    await upsertUser({ fid, main_eth_address: ethAddress })
    const itemId = await insertContent({
      user_fid: fid,
      data_type: contentType,
      data_content: contentData,
      price,
    })

    const result: ICreateItemResponse = {
      status: 'ok',
      itemId,
    }

    res.json(result)
  } catch (e) {
    next(e)
  }
}
