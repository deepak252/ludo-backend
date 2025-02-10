import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY
} from '../config/environment.js'

interface CustomJWTPayload extends JwtPayload {
  _id: string
  username: string
  email: string
  fullName?: string
}

export const generateAccessToken = ({
  _id,
  username,
  email,
  fullName
}: CustomJWTPayload): string => {
  return jwt.sign(
    { _id, username, email, fullName },
    ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY
    } as SignOptions
  )
}

export const generateRefreshToken = ({ _id }: { _id: string }): string => {
  return jwt.sign(
    { _id },
    REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY
    } as SignOptions
  )
}

export const verifyAccessToken = (token: string): CustomJWTPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET as string) as CustomJWTPayload
  } catch {
    return null
  }
}

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET as string) as JwtPayload
  } catch {
    return null
  }
}

export const getHashedPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, 10)
}

export const comparePassword = async (
  candidatePassword: string,
  password: string
): Promise<boolean> => {
  return await bcryptjs.compare(candidatePassword, password)
}
