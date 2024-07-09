import express from 'express'
import isOwnAction from './is-own-action'

const router = express.Router()

router.get('/is-own', isOwnAction)

export default router
