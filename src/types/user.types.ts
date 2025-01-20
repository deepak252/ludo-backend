import { Types } from 'mongoose'

export type User = {
  _id: Types.ObjectId
  username: string
  fullName: string
  email: string
}
