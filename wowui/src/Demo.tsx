import { DemoDiagram } from './DemoDiagram'
import React, { useState } from 'react'
import { DemoChat } from './DemoChat'
import { QuizData } from './service/api'
import Joyride from 'react-joyride'

const state = {
  steps: [
    {
      target: '.joy-message',
      content: 'This is my awesome feature!',
    },
    {
      target: '.joy-submit',
      content: 'This another awesome feature!',
    },
    {
      target: '.joy-deploy',
      content: 'This another awesome feature!',
    },
  ]
};

export function Demo() {
  const [quizData, setQuizData] = useState<QuizData | undefined>(undefined)
  return (
    <div className="container-fluid">
      <Joyride
        run={false}
        steps={state.steps}
      />
      <div className="row">
        <div className="col-9">
          {quizData && <DemoDiagram quizData={quizData} />}
          {!quizData && <div className="text-center" style={{backgroundColor: '#f8fafc', height: '100vh', border: '1px solid lightgrey', borderRadius: '3px'}}>
            <p className="mt-5">
              ✉️ Send a message in the chat to start creating the application.
            </p>
          </div>}
        </div>
        <div className="col-3">
          <DemoChat onQuizData={async (data) => setQuizData(data)} />
        </div>
      </div>
    </div>
  )
}
