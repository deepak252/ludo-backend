import { Types } from 'mongoose'

export const isMongoId = (val: string) => {
  return val && Types.ObjectId.isValid(val)
}

export const strToMongoId = (val: string) => {
  return new Types.ObjectId(val)
}
