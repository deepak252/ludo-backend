import mongoose from 'mongoose'
import { MONGO_URI } from './environment.js'

export const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('Mongo URL empty')
    }
    console.log('Connecting to db...')
    await mongoose.connect(MONGO_URI)
    console.log('Successfully connected to the database')
  } catch (e) {
    console.error('Error connect to database', e)
    process.exit(1)
  }
}
