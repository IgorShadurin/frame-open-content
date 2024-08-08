import 'beautiful-react-diagrams/styles.css'
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import { cloneElement } from 'react'
import './DemoDiagram.css'
import { Node } from 'beautiful-react-diagrams/@types/DiagramSchema'

const quizData = {
  'shortDescription': 'Test your knowledge of computer science with this quiz.',
  'startBorderColor': '#22b0d0',
  'questionBorderColor': '#b9e7fa',
  'finishBorderColor': '#7fe75c',
  'questions': [
    {
      'question': 'What is RAM?',
      'answers': ['Memory', 'CPU', 'Cache', 'Disk'],
      'correctAnswerIndex': 0,
    },
    {
      'question': 'What is HTTP?',
      'answers': ['Protocol', 'Server', 'Router'],
      'correctAnswerIndex': 0,
    },
    {
      'question': 'What is CSS?',
      'answers': ['Styles', 'Script', 'Markup'],
      'correctAnswerIndex': 0,
    },
    {
      'question': '1What is CSS?11',
      'answers': ['Styles', 'Script', 'Markup'],
      'correctAnswerIndex': 0,
    },
    {
      'question': '1What is CSS?',
      'answers': ['Styles', 'Script', 'Markup'],
      'correctAnswerIndex': 0,
    },
    {
      'question': '2 is CSS?',
      'answers': ['Styles', 'Script', 'Markup'],
      'correctAnswerIndex': 0,
    },
  ],
}

const width = 350
const height = Math.floor(width / 1.91)
const marginRight = 50
const marginTopLine0 = 20
const marginTop = 90

function calculateLineAndIndex(elementIndex: number, itemsPerLine = 3) {
  const line = Math.floor(elementIndex / itemsPerLine)
  let lineIndex = elementIndex % itemsPerLine

  // Apply custom rule for lineIndex
  if (line % 2 !== 0) {
    lineIndex = itemsPerLine - 1 - lineIndex
  }

  return { line, lineIndex }
}

const CustomNode = (props: any, data: { title: string; subtitle: string; borderColor: string; buttons: string[] }) => {
  const { inputs } = props
  const { title, subtitle, borderColor, buttons } = data

  return (
    <div style={{ background: '#f1f1f1', borderRadius: '4px' }}>
      <div style={{ padding: '0px', color: 'white' }}>
        <div className="frame-container" style={{ width, height, borderColor }}>
          <h1 className="frame-title">{title}</h1>
          <p className="frame-subtitle">{subtitle}</p>
        </div>

        <div className="btn-container d-flex justify-content-center">
          {buttons.map(item => <button className="btn btn-outline-secondary disabled">{item}</button>)}
        </div>
      </div>
      <div style={{ marginTop: '0px' }}>
        {inputs.map((port: any) => cloneElement(port, {
          style: { width: '50px', height: '25px', background: '#1B263B' },
        }))}
      </div>
    </div>
  )
}

const nodes: Node<any>[] = [
  {
    id: 'node-1',
    render: props => CustomNode(props, {
      title: 'Quiz time!',
      subtitle: quizData.shortDescription,
      borderColor: quizData.startBorderColor,
      buttons: ['⭐️ Start'],
    }),
    coordinates: [marginRight, marginTopLine0],
  },
]

// @ts-ignore
nodes.push(...quizData.questions.map((question, index) => {
  const step = (index + 1)
  const lineInfo = calculateLineAndIndex(step)
  console.log('lineInfo', lineInfo, 'index', index)
  const x = width * lineInfo.lineIndex + marginRight * (lineInfo.lineIndex + 1)
  const y = height * lineInfo.line + (lineInfo.line === 0 ? marginTopLine0 : marginTop * lineInfo.line)
  console.log(`height (${height}) * lineInfo.line (${lineInfo.line}) + (lineInfo.line ${lineInfo.line} === 0 ? marginTopLine0 (${marginTopLine0}) : marginTop (${marginTop})) * (lineInfo.line (${lineInfo.line}) + 1) = ${y}`)
  console.log('x', x, 'y', y)
  return {
    id: `node-${index + 2}`,
    render: (props: any) => CustomNode(props, {
      title: question.question,
      subtitle: `Question: ${index + 1}/${quizData.questions.length}`,
      borderColor: quizData.questionBorderColor,
      buttons: question.answers,
    }),
    coordinates: [x, y],
  }
}))

const lineInfoFail = calculateLineAndIndex(quizData.questions.length + 1)
const xFail = width * lineInfoFail.lineIndex + marginRight * (lineInfoFail.lineIndex + 1)
const yFail = height * lineInfoFail.line + marginTop * (lineInfoFail.line)
nodes.push({
  // questions + 1 start screen + 1 to start from 1
  id: `node-${quizData.questions.length + 2}`,
  render: props => CustomNode(props, {
    title: 'Congratulations!',
    subtitle: `Correct answers: {N}/${quizData.questions.length}`,
    borderColor: quizData.finishBorderColor,
    buttons: ['⚡ Donate 1 USDC', '🔁 Try again'],
  }),
  coordinates: [xFail, yFail],
})

// add success window
// const lineInfoSuccess = calculateLineAndIndex(quizData.questions.length + 2)
// lineInfoSuccess.line++
// const xSuccess = nodes[nodes.length - 2].coordinates[0]
// const ySuccess = height * lineInfoSuccess.line + marginTop * (lineInfoSuccess.line + 1)
// nodes.push({
//   id: `node-${quizData.questions.length + 3}`,
//   render: props => CustomNode(props, {
//     title: 'You are a genius!',
//     subtitle: quizData.shortDescription,
//     borderColor: 'rgb(0,204,102)',
//   }),
//   coordinates: [xSuccess, ySuccess],
// })

console.log('nodes', nodes)

const links = []
for (let i = 1; i < nodes.length - 1; i++) {
  links.push({
    input: nodes[i - 1].id,
    output: nodes[i].id,
    readonly: true,
  })
}

// last question to success window
links.push({
  input: nodes[nodes.length - 2].id,
  output: nodes[nodes.length - 1].id,
  readonly: true,
})

const initialSchema = createSchema({
  nodes,
  links,
})

export function DemoDiagram() {
  const [schema, { onChange }] = useSchema(initialSchema)

  return (
    <>
      <div style={{ height: '100vh' }}>
        <Diagram schema={schema} onChange={onChange} />
      </div>
    </>
  )
}
