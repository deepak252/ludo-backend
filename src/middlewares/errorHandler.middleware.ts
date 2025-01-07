import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'
import { NODE_ENV } from '../config/environment.js'
import { ResponseFailure } from '../utils/ApiResponse.js'

export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  _: NextFunction
): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500
  const message = err.message || 'Internal Server Error'
  const stack = NODE_ENV === 'production' ? undefined : err.stack
  res.status(statusCode).json(new ResponseFailure(message, statusCode, stack))
}
