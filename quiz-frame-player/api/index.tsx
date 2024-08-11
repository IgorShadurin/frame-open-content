import { Button, FrameContext, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { configureApp } from './utils/frame.js'
import { Box, Heading, Text, vars, VStack } from './utils/style.js'
import { handle } from 'frog/vercel'
import { Quiz } from './quiz/index.js'
import { getQuiz } from './utils/api.js'
import { parseUnits } from 'ethers'

const BORDER = '1em solid grey'

function renderError(c: FrameContext, e: unknown) {
  return c.res({
    title: 'Quiz Error',
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={BORDER}>
        <VStack gap="4">
          <Heading color="black" align="center" size="48">
            Error
          </Heading>

          <Text align="center" size="18">
            {(e as Error).message}
          </Text>
        </VStack>
      </Box>
    ),
    intents: [<Button action="/">🏠 Home</Button>],
  })
}

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
})

async function getQuizData(id: number| string) {
  // todo cache it
  return getQuiz(id)
}

app.frame('/:id', async c => {
  try {
    const { id } = c.req.param()
    if (!id) {
      throw new Error('Invalid param quiz ID')
    }

    const quizData = await getQuizData(id)
    console.log('quizData', quizData)
    const { appTitle } = await configureApp(app, c, 'appAuthUrl')
    const intents = [<Button action={`/next/${id}`}>⭐ Start</Button>]

    return c.res({
      title: appTitle,
      image: (
        <Box grow alignVertical="center" backgroundColor="white" padding="32" border={`1em solid ${quizData.quiz.startBorderColor}`}>
          <VStack gap="4">
            <Heading color="h1Text" align="center" size="64">
              Quiz time!
            </Heading>

            <Text align="center" size="18">
              {quizData.quiz.shortDescription}
            </Text>
          </VStack>
        </Box>
      ),
      intents,
    })
  } catch (e) {
    return renderError(c, e)
  }
})

app.frame('/next/:id', async c => {
  const { id } = c.req.param()
  const quizData = await getQuizData(id)
  const { appTitle } = await configureApp(app, c)
  const buttonData = JSON.parse(c.buttonValue || '{}')
  const questionIndex = buttonData.qi ? Number(buttonData.qi) : 0
  const points = buttonData.p ? Number(buttonData.p) : 0
  const quiz = new Quiz(quizData.quiz, questionIndex, points)
  const isLastQuestion = questionIndex >= quiz.questions.length - 1
  const action = isLastQuestion ? `/result/${id}` : `/next/${id}`

  const answers = quiz.questions[questionIndex].answers.map((item, index) => ({
    text: item,
    index,
  }))
  const shuffled = answers.sort(() => Math.random() - 0.5)
  const intents = await Promise.all([
    ...shuffled.map(async item => {
      const newPoints = quiz.check(item.index).points
      const value = JSON.stringify({ qi: questionIndex + 1, p: newPoints })

      return (
        <Button value={value} action={action}>
          {item.text}
        </Button>
      )
    }),
  ])

  return c.res({
    title: appTitle,
    image: (
      <Box grow alignVertical="center" backgroundColor="white" padding="32" border={`1em solid ${quizData.quiz.questionBorderColor}`}>
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="48">
            {quiz.questions[questionIndex].question}
          </Heading>
          <Text align="center" size="18">
            Question: {questionIndex + 1}/{quiz.questions.length}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.frame('/result/:id', async c => {
  const { id } = c.req.param()
  const { quiz, eth_address, donate_amount } = await getQuizData(id)
  const { appTitle } = await configureApp(app, c)
  const buttonData = JSON.parse(c.buttonValue || '{}')
  // const quiz = new Quiz(quiz)
  const points = buttonData.p ? Number(buttonData.p) : 0
  const pointsText = `${points.toString()} of ${quiz.questions.length}`
  const resultText = 'Congratulations!'
  const intents = [<Button.Transaction
    action={`/${id}`}
    target={`/buy/${donate_amount}/0x${eth_address}`}
  >
    Donate USDC
  </Button.Transaction>, <Button action="/">🔁 Try again</Button>]

  return c.res({
    title: appTitle,
    image: (
      <Box
        grow
        alignVertical="center"
        backgroundColor="white"
        padding="32"
        border={`1em solid ${quiz.finishBorderColor}`}
      >
        <VStack gap="4">
          <Heading color="h1Text" align="center" size="48">
            {resultText}
          </Heading>
          <Text align="center" size="24">
            Correct answers: {pointsText}
          </Text>
        </VStack>
      </Box>
    ),
    intents,
  })
})

app.transaction('/buy/:price/:to', c => {
  const price = c.req.param('price')
  const to = c.req.param('to')
  const abi = [
    {
      constant: false,
      inputs: [
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          name: '',
          type: 'bool',
        },
      ],
      type: 'function',
    },
  ]

  return c.contract({
    abi,
    chainId: 'eip155:8453',
    functionName: 'transfer',
    args: [to, parseUnits(price, 6)],
    // USDC on Base contract address
    to: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    value: 0n,
  })
})

// @ts-ignore Vercel info
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'

console.log('isProduction', isProduction) // eslint-disable-line no-console

if (!isProduction) {
  devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })
}

export const GET = handle(app)
export const POST = handle(app)
