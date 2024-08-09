import express from 'express'
import isOwnAction from './is-own-action'
import invoiceAction from './invoice-action'
import createItemAction from './create-item-action'
import openAction from './open-action'
import getOpenAction from './get-open-action'
import aiQuizAction from './ai-quiz-action'
import createQuizAction from './create-quiz-action'
import getQuizAction from './get-quiz-action'
import rateLimit from 'express-rate-limit'

const maxRequests = 10
const aiQuizLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  limit: maxRequests, // limit each IP to 10 requests per windowMs
  message: `You have exceeded the ${maxRequests} requests in 24 hrs limit!`,
  legacyHeaders: true, // send rate limit info in the response headers
})

const router = express.Router()

router.post('/is-own', isOwnAction)
router.post('/invoice', invoiceAction)
router.post('/create-item', createItemAction)
router.post('/open', openAction)
router.get('/open', getOpenAction)

router.post('/ai-quiz', aiQuizLimiter, aiQuizAction)
router.post('/create-quiz', createQuizAction)
router.get('/get-quiz', getQuizAction)

export default router
