export interface QuizData {
  shortDescription: string
  startBorderColor: string
  questionBorderColor: string
  finishBorderColor: string
  questions: Question[]
}

export interface Question {
  question: string
  answers: string[]
  correctAnswerIndex: number
}

export async function getQuiz(id: number | string): Promise<{ quiz: QuizData; donate_amount: number; eth_address: string}> {
  const response = await fetch(`https://api-open.web4.build/v1/app/get-quiz?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Failed to create quiz')
  }

  const responseJson = await response.json()
  const quiz = responseJson.quiz
  if (!quiz) {
    throw new Error('Quiz not found')
  }

  return responseJson
}
