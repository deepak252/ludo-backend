// import Use/r from '../models/user.model.js'
import { ResponseSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/async_handler.js'

export const getUserProfile = asyncHandler(async (req, _) => {
  return new ResponseSuccess('Profile fetched successfully', req.user, 200)
})

export const searchUsers = asyncHandler(async (req, _) => {
  // const { query = '' } = req.body
  // const result = await User.find(username)
  return new ResponseSuccess('Users fetched successfully', req.user, 200)
})
