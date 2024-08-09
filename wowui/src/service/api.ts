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

export function getQuizData(topic: string): Promise<QuizData> {
  return new Promise(resolve =>
    setTimeout(
      () =>
        resolve({
          shortDescription: 'Test your knowledge of computer science with this quiz.',
          startBorderColor: '#22b0d0',
          questionBorderColor: '#b9e7fa',
          finishBorderColor: '#7fe75c',
          questions: [
            {
              question: 'What is RAM?',
              answers: ['Memory', 'CPU', 'Cache', 'Disk'],
              correctAnswerIndex: 0,
            },
            {
              question: 'What is HTTP?',
              answers: ['Protocol', 'Server', 'Router'],
              correctAnswerIndex: 0,
            },
            {
              question: 'What is CSS?',
              answers: ['Styles', 'Script', 'Markup'],
              correctAnswerIndex: 0,
            },
            {
              question: '1What is CSS?11',
              answers: ['Styles', 'Script', 'Markup'],
              correctAnswerIndex: 0,
            },
            {
              question: '1What is CSS?',
              answers: ['Styles', 'Script', 'Markup'],
              correctAnswerIndex: 0,
            },
            {
              question: '2 is CSS?',
              answers: ['Styles', 'Script', 'Markup'],
              correctAnswerIndex: 0,
            },
          ],
        }),
      500
    )
  )
}
