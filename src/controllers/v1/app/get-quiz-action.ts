import { Request, Response, NextFunction } from 'express'
import { getQuizById } from '../../../db/quiz'
import { IGetQuizResponse } from './interface/IGetQuizResponse'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (req: Request, res: Response<IGetQuizResponse>, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.query

    if (!id || !Number(id)) {
      throw new Error('Invalid id')
    }

    const quiz = await getQuizById(Number(id))

    if (!quiz || !quiz.data) {
      throw new Error('Quiz not found')
    }

    res.json({
      quiz: JSON.parse(quiz.data),
    })
  } catch (e) {
    next(e)
  }
}
