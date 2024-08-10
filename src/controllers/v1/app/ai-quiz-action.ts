import { Request, Response, NextFunction } from 'express'
import { QuizData } from './interface/IAIQuizResponse'
import { getConfigData } from '../../../config'
import { insertAIQuiz } from '../../../db/aiQuiz'
import { getQuizResponse } from '../../../utils/ai'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { openAiApiKey } = getConfigData()
    const { topic } = req.body

    const { quizData, fullData } = await getQuizResponse(openAiApiKey, topic)
    await insertAIQuiz({
      user_request: topic,
      ai_response: JSON.stringify(fullData),
    })

    if (!quizData) {
      throw new Error('Quiz can not be created because AI decided that it is not possible')
    }

    res.json({
      quiz: quizData as QuizData,
    })
  } catch (e) {
    next(e)
  }
}
