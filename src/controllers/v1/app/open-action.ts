import { Request, Response, NextFunction } from 'express'
import { getOpenParams } from './utils/user'
import { IOpenRequest } from './interface/IOpenRequest'
import { upsertUser } from '../../../db/user'
import { v4 as uuidv4 } from 'uuid'
import { ComposerActionFormResponse } from './interface/IComposerAction'
import { setSessionInfo } from '../../../utils/clicks'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (
  req: Request<IOpenRequest>,
  res: Response<ComposerActionFormResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { fid, ethAddress, text } = await getOpenParams(req)

    await upsertUser({ fid, main_eth_address: ethAddress })
    const sessionId = uuidv4()
    await setSessionInfo(sessionId, fid)

    const result: ComposerActionFormResponse = {
      type: 'form',
      title: 'Data for Sale',
      url: `https://open.web4.build/?session=${sessionId}&text=${encodeURIComponent(text)}`,
    }

    res.json(result)
  } catch (e) {
    next(e)
  }
}
