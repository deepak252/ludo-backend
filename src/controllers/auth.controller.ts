import { INVALID_USERNAMES } from '../constants/index.js'
import User from '../models/user.model.js'
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

  return new ResponseSuccess(
    'Sign up successful',
    { user: user.toJSON(), accessToken },
    201
  )
})

export const signIn = asyncHandler(async (req, _) => {
  const { usernameOrEmail, password } = req.body
  if (!usernameOrEmail || !password) {
    throw new ApiError('username/email and password are required')
  }
  const user = await User.findByUsernameOrEmail(usernameOrEmail)
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError('Invalid username/email or password')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id.toString()
  )
  req.session.accessToken = accessToken

  return new ResponseSuccess(
    'Sign in successful',
    { user: user.toJSON(), accessToken },
    200
  )
})

export const checkUsernameAvailable = asyncHandler(async (req, _) => {
  const { username } = req.body
  if (!username) {
    throw new ApiError('Username is required')
  }
  if (INVALID_USERNAMES.includes(username.toLowerCase())) {
    throw new ApiError('Username is not available')
  }
  const result = await User.findByUsername(username)
  if (result) {
    throw new ApiError('Username is not available')
  }
  return new ResponseSuccess('Username is available', {}, 200)
})

export const signOut = asyncHandler(async (req: any, _: any) => {
  const isSessionDestroyed = await new Promise<boolean>((resolve, reject) => {
    req.session.destroy((err: any) => {
      if (err) {
        reject(false)
      } else {
        resolve(true)
      }
    })
  })
  if (!isSessionDestroyed) {
    throw new ApiError('Sign out failed')
  }
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: { refreshToken: 1 } // remove the field from document
    },
    { new: true } //ensures that the updated document is returned.
  )
  return new ResponseSuccess('Sign out successful', {}, 200)
})
