import { Request, Response, NextFunction } from 'express'
import { QuizData } from './interface/IAIQuizResponse'
import OpenAI from 'openai'
import z from 'zod'
import { zodFunction } from 'openai/helpers/zod'

/**
 *
 * @param req Request
 * @param res Response
 * @param next Next function
 */
export default async (
  // req: Request<IAIQuizRequest>,
  // res: Response<IAIQuizResponse>,
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { topic } = req.body
    const QuestionSchema = z.object({
      question: z.string(),
      answers: z.array(z.string()),
      correctAnswerIndex: z.number(),
    })

    const QuizDataSchema = z.object({
      shortDescription: z.string(),
      startBorderColor: z.string(),
      questionBorderColor: z.string(),
      finishBorderColor: z.string(),
      questions: z.array(QuestionSchema),
    })

    const client = new OpenAI({
      apiKey: '',
    })

    const completion = await client.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. You help users to make quiz in the specified format only. Quiz consists of 5 questions. Each questions consists of 4 answers. "correctAnswerIndex" field should be 0. Correct answer should be under the index zero of questions. Colors should be in HEX format started with #.' +
            '"shortDescription" max length is 25 symbols but detailed and should fill these symbols. "question" max length is 25 symbols, detailed. Answer max length is 6 symbols. Lengths are very important. Please follow the format. Try to fill all max lengths if possible.',
        },
        {
          role: 'user',
          content: `Create quiz about: ${topic}`,
        },
      ],
      tools: [zodFunction({ name: 'quiz', parameters: QuizDataSchema })],
    })

    const quiz = completion?.choices?.[0]?.message.tool_calls?.[0]?.function.parsed_arguments

    if (!quiz) {
      throw new Error('Quiz can not be created')
    }

    res.json({
      quiz: quiz as QuizData,
    })
  } catch (e) {
    next(e)
  }
}
