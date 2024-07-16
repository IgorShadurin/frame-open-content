import React, { useEffect, useState } from 'react'
import { Form, Button, InputGroup, FormControl, Alert, Collapse } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'

const App: React.FC = () => {
  const [clickData, setClickData] = useState('')
  const [textInput, setTextInput] = useState('')
  const [price, setPrice] = useState(1.0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successUrl, setSuccessUrl] = useState<string | null>(null)

  useEffect(() => {
    // get query params clickData, store it in state and remove it from the URL
    const url = new URL(window.location.href)
    const clickData = url.searchParams.get('clickData')
    if (clickData) {
      setClickData(clickData)
      url.searchParams.delete('clickData')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 400) {
      setTextInput(e.target.value)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0.1 && value <= 99.1) {
      setPrice(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessUrl(null)

    const formData = {
      contentType: 'text',
      contentData: textInput,
      price: price.toString(),
      clickData,
    }

    try {
      const response = await fetch('https://api-open.web4.build/v1/app/create-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit the form')
      }

      const data = await response.json()
      setSuccessUrl(data.shareUrl)
      setTextInput('')
      setPrice(1.0)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mt-4 d-flex justify-content-center">
      {!clickData && <div style={{ maxWidth: '600px', width: '100%' }}>
        <Alert variant="warning">
          No user data found. Please open the app from Farcaster or send Email to <a
          href="mailto:igor.shadurin@gmail.com?subject=Open%20Content%20Frame%20Issue">igor.shadurin@gmail.com</a>.
        </Alert>
      </div>}

      {
        clickData && <div style={{ maxWidth: '600px', width: '100%' }}>
          <div className="mb-4">
            <div className="d-flex align-items-center">
              <img src="/bot.png" alt="Web4.Build Bot" width={30} style={{ marginRight: 8 }} />
              <h3 className="m-0">Data for Sale</h3>
            </div>
          </div>
          <hr />
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTextInput" className="position-relative">
              <Form.Label style={{ fontWeight: 'bold' }}>Text for Sale</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={textInput}
                onChange={handleTextInputChange}
                disabled={isSubmitting}
                placeholder="Enter text for sale..."
                className="text-area-with-counter"
              />
              <div className="textarea-counter">
                {textInput.length}/400
              </div>
            </Form.Group>

            <Form.Group controlId="formPriceInput" className="mt-3">
              <Form.Label style={{ fontWeight: 'bold' }}>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>USDC</InputGroup.Text>
                <FormControl
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                  min={0.1}
                  max={99.1}
                  step={0.1}
                  disabled={isSubmitting}
                />
              </InputGroup>
            </Form.Group>

            <Button
              variant="outline-primary"
              type="submit"
              disabled={isSubmitting || textInput.length < 3}
              className="mt-3 w-100"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          {successUrl && (
            <InputGroup className="mt-3">
              <FormControl
                type="text"
                value={successUrl}
                readOnly
              />
              <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText(successUrl)}>
                Copy
              </Button>
            </InputGroup>
          )}

          <hr />
          <div className="mb-4 d-flex flex-column align-items-center">
            <Button
              variant="link"
              onClick={() => setShowMore(!showMore)}
              aria-controls="example-collapse-text"
              aria-expanded={showMore}
            >
              How does it work?
            </Button>
            <Collapse in={showMore}>
              <div id="example-collapse-text" className="mt-3">
                <p>Use this form to sell text for USDC on the Base chain.</p>
                <p>Enter up to 400 characters of text and set a price between 0.1 and 99.1 USDC.</p>
                <p>After creation, you will receive a link to share on Farcaster. Payments go to your Farcaster custody
                  address. No fees.</p>
              </div>
            </Collapse>
          </div>

          <div className="mb-4 d-flex justify-content-center">
            <div className="d-flex align-items-center">
              Powered by
              <img src="/bot.png" alt="Web4.Build Bot" width={30} style={{ marginLeft: 8, marginRight: 8 }} />
              <p className="m-0"><a href="https://web4.build" target="_blank" rel="noreferrer">Web4.Build</a></p>
            </div>
          </div>

        </div>}
    </div>
  )
}

export default App
