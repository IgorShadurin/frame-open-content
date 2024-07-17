import express from 'express'
import isOwnAction from './is-own-action'
import invoiceAction from './invoice-action'
import createItemAction from './create-item-action'
import openAction from './open-action'

const router = express.Router()

router.post('/is-own', isOwnAction)
router.post('/invoice', invoiceAction)
router.post('/create-item', createItemAction)
router.post('/open', openAction)

export default router
