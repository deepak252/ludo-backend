import { NextFunction, Request, Response } from 'express'
import { Socket } from 'socket.io'
import { ApiError } from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/auth_util.js'
import User from '../models/user_model.js'
import { UserService } from '../services/user_service.js'

export const verifyUser = async (accessToken?: string) => {
  if (!accessToken) {
    throw new Error('Unauthorized access')
  }
  const decodedToken = verifyAccessToken(accessToken)
  const user = await User.findById(decodedToken?._id)
    .select('-password -refreshToken')
    .lean()
  if (!user) {
    throw new Error('Invalid access token')
  }
  return user
}

/**
 *  Verify accessToken (mandatory)
 * */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      req.session.accessToken ||
      req.headers.authorization?.replace('Bearer ', '')
    req.user = await verifyUser(accessToken)

    next()
  } catch (e: any) {
    next(new ApiError(e?.message || 'Unauthorized access', 401))
  }
}

/**
 *  Verify accessToken (not mandatory)
 * */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken =
      req.session.accessToken ||
      req.headers.authorization?.replace('Bearer ', '')
    req.user = await verifyUser(accessToken)
  } catch (e: any) {
    console.log(e)
  }
  next()
}

/**
 * Middleware to authenticate the user based on access token for Socket.IO
 */
export const requireSocketAuth = async (
  socket: Socket,
  next: (err?: any) => void
) => {
  try {
    const accessToken = socket.handshake.headers['authorization']?.replace(
      'Bearer ',
      ''
    )
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    // Verify the user using the access token
    socket.user = await verifyUser(accessToken)
    await UserService.setUserSocketId(socket.user.username, socket.id)
  } catch (e: any) {
    console.log(e)
    // next(new Error(e.message || 'Unauthorized access'))
  }
  next()
}
