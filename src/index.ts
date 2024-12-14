import app from './app.js'
import { SERVER_PORT } from './config/environment.js'

app.listen(SERVER_PORT, () => {
  console.log('Server is running on port : ', SERVER_PORT)
})
