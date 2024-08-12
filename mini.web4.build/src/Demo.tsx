import { DemoDiagram } from './DemoDiagram'
import React, { useEffect, useState } from 'react'
import { DemoChat } from './DemoChat'
import { QuizData } from './service/api'
import Joyride from 'react-joyride'

const state1 = {
  steps: [
    {
      target: '.joy-message',
      content: '✨ Enter the quiz topic you want the AI to create. Then, specify the donation amount in USDC coins and provide the Ethereum address where the tokens should be sent.',
    },
    {
      target: '.joy-submit',
      content: '✅ Submit the info to the AI so it can create the quiz.',
    },
  ],
}

const state2 = {
  steps: [
    {
      target: '.joy-deploy',
      content: '💾 Save the application code on our servers to start using it.',
    },
  ],
}

export function Demo() {
  const [quizData, setQuizData] = useState<QuizData | undefined>(undefined)
  const [joyPart1, setJoyPart1] = useState(false)
  const [joyPart2, setJoyPart2] = useState(false)

  useEffect(() => {
    setJoyPart1(true)
  }, [])

  return (
    <div className="container-fluid">
      <div className={'d-block d-md-none text-center'}>
        <h1 className="mt-5">Use a PC for the Best Experience</h1>
        <p>For a more comfortable experience, please visit this page using a desktop or laptop computer.</p>
      </div>

      <div className="d-none d-md-block">
        <div className="row">
          <Joyride
            run={joyPart1}
            steps={state1.steps}
            continuous={true}
          />
          <Joyride
            run={joyPart2}
            steps={state2.steps}
            continuous={true}
          />
          <div className="col-9">
            {quizData && <DemoDiagram quizData={quizData} />}
            {!quizData && <div className="text-center" style={{
              backgroundColor: '#f8fafc',
              height: '100vh',
              border: '1px solid lightgrey',
              borderRadius: '3px',
            }}>
              <p className="mt-5">
                ✉️ Send a message in the <strong>panel on the right</strong> to start creating your app.
              </p>

              <div className="mt-5 video-responsive">
                <iframe width="900" height="507" src="https://www.youtube.com/embed/TmoItyYFdU8?si=9p3tz7Kf2myfBHdN"
                        title="YouTube video player" frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
              </div>
            </div>}
          </div>
          <div className="col-3">
            <DemoChat onQuizData={async (data) => {
              setQuizData(data)
              setJoyPart1(false)
              setJoyPart2(true)
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
