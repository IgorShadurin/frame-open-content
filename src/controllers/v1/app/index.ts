import express from 'express'
import isOwnAction from './is-own-action'
import invoiceAction from './invoice-action'

const router = express.Router()

router.post('/is-own', isOwnAction)
router.post('/invoice', invoiceAction)

export default router
