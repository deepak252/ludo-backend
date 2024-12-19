import { ApiResponse } from '@/utils/ApiResponse.js'

export const signUp = async (req: any, res: any) => {
  req.session.user = { email: 'user@gmail.com' }
  return res.json(new ApiResponse('Sign up successful', undefined, 201))
}

export const signIn = async (req: any, res: any) => {
  req.session.user = { email: 'user@gmail.com' }
  return res.json(new ApiResponse('Sign in successful', undefined, 201))
}

export const signOut = async (req: any, res: any) => {
  req.session.user = null
  // req.session.save(function (err: any) {
  //   if (err) {
  //     return res.json(new Ap('Sign out successful', undefined, 201))
  //   }

  //   // regenerate the session, which is good practice to help
  //   // guard against forms of session fixation
  //   req.session.regenerate(function (err) {
  //     if (err) next(err)
  //     res.redirect('/')
  //   })
  // })
  return res.json(new ApiResponse('Sign out successful', undefined, 201))
}

export const getUserProfile = async (req: any, res: any) => {
  return res.json(
    new ApiResponse(
      'Profile fetched successfully',
      { session: req.session.user },
      201
    )
  )
}
