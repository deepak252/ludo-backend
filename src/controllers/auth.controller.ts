import User from '../models/user.model.js'
import { UserService } from '../services/user.service.js'
import { ApiError } from '../utils/ApiError.js'
import { ResponseSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const generateAccessAndRefreshTokens = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError('User not found')
  }
  const accessToken = user.getAccessToken()
  const refreshToken = user.getRefreshToken()
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })
  return { accessToken, refreshToken }
}

export const signUp = asyncHandler(async (req, _) => {
  const { username, email, password } = req.body
  let user = new User({
    username,
    email,
    password
  })
  const error = user.validateSync()
  if (error) {
    throw new ApiError(error.message)
  }
  user = await user.save()
  const accessToken = user.getAccessToken()
  user = user.toJSON()
  delete user.password
  delete user.refreshToken

  return new ResponseSuccess('Sign up successful', { user, accessToken }, 201)

  // const { username } = req.body
  // if (!username) {
  //   throw new ApiError('Username is required')
  // }
  // const user = await UserService.createUser(username)
  // req.session.user = user
  // return new ResponseSuccess('Sign up successful', user, 201)
})

export const signIn = asyncHandler(async (req, _) => {
  const { usernameOrEmail, password } = req.body
  if (!usernameOrEmail || !password) {
    throw new ApiError('username/email and password are required')
  }
  let user = await User.findByUsernameOrEmail(usernameOrEmail)
  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError('Invalid username/email or password')
  }
  user = user.toJSON()
  delete user.password
  delete user.refreshToken

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id.toString()
  )

  const options = {
    httpOnly: true,
    secure: true
  }
  // const { username } = req.body
  // if (!username) {
  //   throw new ApiError('Username is required')
  // }
  // const user = await UserService.getUser(username)
  // if (!user) {
  //   throw new ApiError('User not found')
  // }
  // req.session.user = user

  // return new ResponseSuccess('Sign in successful', user, 201)
})

export const signOut = asyncHandler(async (req: any, _: any) => {
  req.session.user = null
  return new ResponseSuccess('Sign out successful', undefined, 201)
})
