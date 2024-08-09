import React, { useState } from 'react'
import './DemoChat.css'
import { Button, Form, Modal } from 'react-bootstrap'
import { getQuizData, getQuizDataFake, QuizData } from './service/api'

export function DemoChat({ onQuizData }: { onQuizData: (data: QuizData) => Promise<void> }) {
  const [topic, setTopic] = useState('dogs')
  const [donate, setDonate] = useState('1')
  const [wallet, setWallet] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
  const [loading, setLoading] = useState(false)
  const [deployed, setDeployed] = useState(false)
  const [deployUrl, setDeployUrl] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [currentField, setCurrentField] = useState('')
  const [tempValue, setTempValue] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // const quizData = await getQuizData(topic)
      const quizData = await getQuizDataFake(topic)
      console.log('quizData', quizData)
      await onQuizData(quizData)
    } catch (e) {
      console.log('Quiz data submit error', e)
      alert(`Quiz creation failed: ${(e as Error).message}`)
    }

    setLoading(false)
    setDeployed(true)
  }

  const handleDeploy = async () => {
    setLoading(true)
    // Simulate async operation for deploying the quiz
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setDeployUrl('https://example.com/quiz')
  }

  const handleShowModal = (field: string, value: string) => {
    setCurrentField(field)
    setTempValue(value)
    setShowModal(true)
  }

  const handleSave = (e: any) => {
    if (currentField === 'topic') setTopic(tempValue)
    if (currentField === 'donate') setDonate(tempValue)
    if (currentField === 'wallet') setWallet(tempValue)
    setShowModal(false)
  }

  return (
    <div className="demo-chat-container p-3">
      <div className="text-center">
        <h3>Create Mini-app with AI</h3>
      </div>

      <div className="joy-message container mt-5 p-3 border rounded bg-light">
        <div>
          <span>Hey! Create a quiz about </span>
          <span
            className="text-primary url-text-data"
            onClick={() => handleShowModal('topic', topic)}
            style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
          >
            {topic}
          </span>
          <span>. Come up with 5 questions, each with 4 answer options.</span>
          <br />
          <br />
          <span>At the end of the quiz, ask to donate </span>
          <span
            className="text-primary url-text-data"
            onClick={() => handleShowModal('donate', donate)}
            style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
          >
            {donate}
          </span>
          <span> USDC to </span>
          <span
            className="text-primary url-text-data"
            onClick={() => handleShowModal('wallet', wallet)}
            style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
          >
            {wallet.substring(0, 20) + '...'}
          </span>
          <span> on the Base network.</span>
        </div>
      </div>

      <div className="mt-3">
        {deployed ? (
          <>
            <div className="alert alert-info">
              Like the generated app? Deploy it!
            </div>
            <button type="button" className="joy-deploy btn btn-outline-primary mx-1" onClick={handleDeploy}
                    disabled={loading}>
              🚀 {loading ? 'Deploying...' : 'Deploy'}
            </button>
            <button type="button" className="joy-deploy btn btn-outline-secondary" onClick={() => setDeployed(false)}
                    disabled={loading}>
              Cancel
            </button>
            {deployUrl && (
              <div className="mt-3">
                <a href={deployUrl} target="_blank" rel="noopener noreferrer">Open deployed app</a>
              </div>
            )}
          </>
        ) : (
          <button type="submit" className="joy-submit btn btn-outline-primary" onClick={handleSubmit}
                  disabled={loading}>
            {loading ? '⏳ Submitting...' : 'Submit'}
          </button>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit {currentField}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>{`Enter new ${currentField}`}</Form.Label>
            <Form.Control
              type="text"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
