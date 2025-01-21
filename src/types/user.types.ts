import { Types } from 'mongoose'

export type UserDocument = {
  _id: Types.ObjectId
  username: string
  fullName: string
  email: string
  password: string
  refreshToken: string
}
