import { NextFunction, Request, Response } from 'express'
import { ApiResponse, ResponseSuccess } from './ApiResponse.js'

export const asyncHandler = (
  controller: (req: Request, res: Response) => Promise<ResponseSuccess | any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // controller(req, res).catch(next)
    controller(req, res)
      .then((result) => {
        if (result instanceof ApiResponse) {
          return res.status(result.code).json(result)
        }
      })
      .catch(next)
  }
}
