import 'beautiful-react-diagrams/styles.css'
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import { cloneElement } from 'react'
import './DemoDiagram.css'
import { Node } from 'beautiful-react-diagrams/@types/DiagramSchema'

const quizData = {
  'shortDescription': 'Test your knowledge of computer science with this quiz.',
  'questions': [
    {
      'question': 'What is RAM?',
      'answers': ['Memory', 'CPU', 'Cache'],
      'correctAnswerIndex': 0,
    },
    {
      'question': 'What is HTTP?',
      'answers': ['Protocol', 'Server', 'Router'],
      'correctAnswerIndex': 0,
    },
    {
      'question': '1What is CSS?',
      'answers': ['Styles', 'Script', 'Markup'],
      'correctAnswerIndex': 0,
    },
    // {
    //   'question': '1What is CSS?11',
    //   'answers': ['Styles', 'Script', 'Markup'],
    //   'correctAnswerIndex': 0,
    // },
    // {
    //   'question': '1What is CSS?',
    //   'answers': ['Styles', 'Script', 'Markup'],
    //   'correctAnswerIndex': 0,
    // },
    // {
    //   'question': '2 is CSS?',
    //   'answers': ['Styles', 'Script', 'Markup'],
    //   'correctAnswerIndex': 0,
    // },
  ],
}

const width = 400
const height = Math.floor(width / 1.91)
const marginRight = 50
const marginBottom = 50

function calculateLineAndIndex(elementIndex: number, itemsPerLine = 3) {
  const line = Math.floor(elementIndex / itemsPerLine)
  let lineIndex = elementIndex % itemsPerLine

  // Apply custom rule for lineIndex
  if (line % 2 !== 0) {
    lineIndex = itemsPerLine - 1 - lineIndex
  }

  return { line, lineIndex }
}

const CustomNode = (props: any, data: { title: string; subtitle: string }) => {
  const { inputs } = props
  const { title, subtitle } = data
  const buttonsHeight = 53

  return (
    <div style={{ background: '#f1f1f1', borderRadius: '4px' }}>
      <div style={{ padding: '0px', color: 'white' }}>
        {/*<img src={logo} alt="Screen" width={width} height={height} className="img-not-draggable" />*/}
        <div className="frame-container" style={{ width, height }}>
          <h1 className="frame-title">{title}</h1>
          <p className="frame-subtitle">{subtitle}</p>
        </div>
        {/*<br />*/}
        {/*<img src={logo} alt="Buttons" style={{ border: '1px solid lightgrey' }} width={width} height={buttonsHeight}*/}
        {/*     className="img-not-draggable" />*/}
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
    }),
    coordinates: [marginRight, marginBottom],
  },
]

// @ts-ignore
nodes.push(...quizData.questions.map((question, index) => {
  const step = (index + 1)
  const lineInfo = calculateLineAndIndex(step)
  console.log('lineInfo', lineInfo)
  const x = width * lineInfo.lineIndex + marginRight * (lineInfo.lineIndex + 1)
  const y = height * lineInfo.line + marginBottom * (lineInfo.line + 1)
  return {
    id: `node-${index + 2}`,
    render: (props: any) => CustomNode(props, {
      title: question.question,
      subtitle: `Question: ${index + 1}/${quizData.questions.length}`,
    }),
    coordinates: [x, y],
  }
}))

const links = []
for (let i = 1; i < nodes.length; i++) {
  links.push({
    input: nodes[i - 1].id,
    output: nodes[i].id,
    readonly: true
  })
}

const initialSchema = createSchema({
  nodes,
  links,
})

export function DemoDiagram() {
  const [schema, { onChange }] = useSchema(initialSchema)

  return (
    <div style={{ height: '70vh' }}>
      <Diagram schema={schema} onChange={onChange} />
    </div>
  )
}
