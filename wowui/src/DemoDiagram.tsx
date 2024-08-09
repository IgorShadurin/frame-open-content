import 'beautiful-react-diagrams/styles.css'
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams'
import { cloneElement } from 'react'
import './DemoDiagram.css'
import { Node } from 'beautiful-react-diagrams/@types/DiagramSchema'
import { QuizData } from './service/api'

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
        <div className="frame-container text-center p-1" style={{ width, height, borderColor }}>
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

function getQuizSchema(quizData: QuizData | undefined) {
  if (!quizData) {
    return createSchema({
      nodes: [],
      links: [],
    })
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
    const x = width * lineInfo.lineIndex + marginRight * (lineInfo.lineIndex + 1)
    const y = height * lineInfo.line + (lineInfo.line === 0 ? marginTopLine0 : marginTop * lineInfo.line)
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
      buttons: ['⚡ Donate USDC', '🔁 Try again'],
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

  return createSchema({
    nodes,
    links,
  })
}

export function DemoDiagram({ quizData }: { quizData: QuizData | undefined }) {
  const [schema, { onChange }] = useSchema(getQuizSchema(quizData))

  return (
    <>
      <div style={{ height: '100vh' }}>
        <Diagram schema={schema} onChange={onChange} />
      </div>
    </>
  )
}
