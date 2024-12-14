import express from 'express'
import { ApiResponse } from './utils/ApiResponse.js'

const app = express()

app.use(express.json())

app.get('/', (_, res) => {
  res.json(new ApiResponse('Server is up'))
})

export default app
