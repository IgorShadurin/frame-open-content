import { db } from './index'

export const AI_QUIZ_TABLE_NAME = 'ai_quiz'

export interface IAIQuiz {
  id?: number
  user_request: string
  ai_response: string
  created_at?: string | Date
  updated_at?: string | Date
}

export async function insertAIQuiz(aiQuizData: Omit<IAIQuiz, 'created_at' | 'updated_at' | 'id'>): Promise<number> {
  const date = db.fn.now()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newAIQuiz: IAIQuiz = { ...aiQuizData, created_at: date, updated_at: date }
  const [insertedId] = await db(AI_QUIZ_TABLE_NAME).insert(newAIQuiz)

  return insertedId
}

export async function getAIQuizCount(): Promise<number> {
  const count = await db(AI_QUIZ_TABLE_NAME).count('* as count').first()

  return Number(count?.count || 0)
}

export async function getAIQuizById(quizId: number): Promise<IAIQuiz | undefined> {
  return db(AI_QUIZ_TABLE_NAME).where({ id: quizId }).first()
}

export async function getAllAIQuizzes(): Promise<IAIQuiz[]> {
  return db(AI_QUIZ_TABLE_NAME).select('*')
}

export async function updateAIQuiz(
  quizId: number,
  updateData: Partial<Omit<IAIQuiz, 'id' | 'created_at'>>,
): Promise<void> {
  const date = db.fn.now()
  await db(AI_QUIZ_TABLE_NAME)
    .where({ id: quizId })
    .update({ ...updateData, updated_at: date })
}
