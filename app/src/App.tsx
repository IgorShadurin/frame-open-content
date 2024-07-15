import React, { useState } from 'react'
import { Form, Button, InputGroup, FormControl, Alert } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const App: React.FC = () => {
  const [textInput, setTextInput] = useState('')
  const [price, setPrice] = useState(1.0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successUrl, setSuccessUrl] = useState<string | null>(null)

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
      textInput,
      price
    }

    try {
      const response = await fetch('https://example.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit the form')
      }

      const data = await response.json()
      setSuccessUrl(data.url)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div className="mb-4">
          <h3>Create Hidden Content for Sale</h3>
          <p>Use this form to sell hidden content with USDC payments on the Base chain.</p>
          <p>Enter up to 400 characters of text and set a price between 0.1 and 99.1 USDC.</p>
          <p>After creation, you will get a link to share on Farcaster. Payments go to your Farcaster custody address. No fees.</p>
        </div>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTextInput">
            <Form.Label>Text for Sale</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={textInput}
              onChange={handleTextInputChange}
              disabled={isSubmitting}
            />
            <Form.Text>{textInput.length}/400</Form.Text>
          </Form.Group>

          <Form.Group controlId="formPriceInput" className="mt-3">
            <Form.Label>Price</Form.Label>
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
            variant="outline-secondary"
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
      </div>
    </div>
  )
}

export default App
