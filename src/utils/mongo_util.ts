import { Document, Types } from 'mongoose'

export const isMongoId = (val: string) => {
  return val && Types.ObjectId.isValid(val)
}

export const strToMongoId = (val: string) => {
  try {
    return new Types.ObjectId(val)
  } catch (e) {
    console.log('strToMongoId error: ', e)
  }
}

export const flatMapObject = (data: any) => {
  return Object.entries(data).flatMap(([key, value]) => [
    key,
    stringifyValue(value)
  ])
}

export const flatMongoDocument = (document: Document) => {
  return flatMapObject(document.toObject())
}

const stringifyValue = (value: any) => {
  if (isMongoId(value)) {
    return value.toString()
  } else if (value instanceof Date) {
    return value.toString()
  } else if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return value
}
