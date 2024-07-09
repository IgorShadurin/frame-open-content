import app from './app'

import express from 'express'

const router = express.Router()

router.use('/app', app)

export default router
