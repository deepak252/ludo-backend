import { UserService } from '@/services/user.service.js'
import { ApiError } from '@/utils/ApiError.js'
import { ResponseSuccess } from '@/utils/ApiResponse.js'
import { asyncHandler } from '@/utils/asyncHandler.js'

export const signUp = asyncHandler(async (req, _) => {
  const { username } = req.body
  if (!username) {
    throw new ApiError('Username is required')
  }
  const user = await UserService.createUser(username)
  req.session.user = user
  return new ResponseSuccess('Sign up successful', user, 201)
})

export const signIn = asyncHandler(async (req, _) => {
  const { username } = req.body
  if (!username) {
    throw new ApiError('Username is required')
  }
  const user = await UserService.getUser(username)
  if (!user) {
    throw new ApiError('User not found')
  }
  req.session.user = user

  return new ResponseSuccess('Sign in successful', user, 201)
})

export const signOut = asyncHandler(async (req: any, _: any) => {
  req.session.user = null
  return new ResponseSuccess('Sign out successful', undefined, 201)
})
