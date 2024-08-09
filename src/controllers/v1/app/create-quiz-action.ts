import { Request, Response, NextFunction } from 'express'
import { ICreateQuizRequest } from './interface/ICreateQuizRequest'
import { ICreateQuizResponse } from './interface/ICreateQuizResponse'
import { insertQuiz } from '../../../db/quiz'
import { safeJsonParse } from '../../../utils/json'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (
  req: Request<ICreateQuizRequest>,
  res: Response<ICreateQuizResponse>,
  next: NextFunction,
): Promise<void> => {
  try {
    const { quiz, donate_amount, eth_address } = req.body
    const ethAddressPrepared = eth_address.replace('0x', '')

    if (!ethAddressPrepared || ethAddressPrepared.length !== 40) {
      throw new Error('Invalid eth address')
    }

    if (!donate_amount || isNaN(Number(donate_amount)) || Number(donate_amount) <= 0) {
      throw new Error('Invalid donate amount')
    }

    if (!quiz) {
      throw new Error('Empty quiz')
    }

    safeJsonParse(quiz, 'Invalid quiz json')

    const id = await insertQuiz({
      data: quiz,
      donate_amount,
      eth_address: ethAddressPrepared,
    })

    res.json({
      status: 'ok',
      id,
    })
  } catch (e) {
    next(e)
  }
}
