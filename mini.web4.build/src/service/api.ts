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

export async function createQuiz(topic: string, quiz: string, ethAddress: string, amount: string): Promise<number> {
  const response = await fetch('https://api-open.web4.build/v1/app/create-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: topic,
      quiz,
      donate_amount: amount,
      eth_address: ethAddress,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to create quiz')
  }

  const json = await response.json()
  if (!json.id) {
    throw new Error('Invalid quiz ID')
  }

  return json.id
}

export async function getQuizData(topic: string): Promise<QuizData> {
  const response = await fetch('https://api-open.web4.build/v1/app/ai-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  })
  if (!response.ok) {
    throw new Error('Failed to get quiz data')
  }

  const json = await response.json()
  if (!json.quiz) {
    throw new Error('Invalid quiz data')
  }

  return json.quiz
}

export function getQuizDataFake(topic: string): Promise<QuizData> {
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
              question: 'What is RAM? Hello world ahahah',
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
      500,
    ),
  )
}
