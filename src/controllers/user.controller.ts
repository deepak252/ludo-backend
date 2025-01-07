import { ResponseSuccess } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getUserProfile = asyncHandler(async (req, _) => {
  return new ResponseSuccess(
    'Profile fetched successfully',
    req.session.user,
    201
  )
})
