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

export interface IAIQuizResponse {
  quiz: QuizData
}
