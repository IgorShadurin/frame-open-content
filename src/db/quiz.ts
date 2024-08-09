import { db } from './index'

export const QUIZ_TABLE_NAME = 'quiz'

export interface IQuiz {
  id?: number
  data: string
  donate_amount: string
  eth_address: string
  created_at?: string
  updated_at?: string
}

export async function insertQuiz(quizData: Omit<IQuiz, 'created_at' | 'updated_at' | 'id'>): Promise<number> {
  const date = db.fn.now()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newQuiz: IQuiz = { ...quizData, created_at: date, updated_at: date }
  const [insertedId] = await db(QUIZ_TABLE_NAME).insert(newQuiz)

  return insertedId
}

export async function getQuizCount(): Promise<number> {
  const count = await db(QUIZ_TABLE_NAME).count('* as count').first()

  return Number(count?.count || 0)
}

export async function getQuizById(quizId: number): Promise<IQuiz | undefined> {
  return db(QUIZ_TABLE_NAME).where({ id: quizId }).first()
}

export async function getAllQuizzes(): Promise<IQuiz[]> {
  return db(QUIZ_TABLE_NAME).select('*')
}

export async function updateQuiz(quizId: number, updateData: Partial<Omit<IQuiz, 'id' | 'created_at'>>): Promise<void> {
  const date = db.fn.now()
  await db(QUIZ_TABLE_NAME)
    .where({ id: quizId })
    .update({ ...updateData, updated_at: date })
}
