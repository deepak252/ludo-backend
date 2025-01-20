import { Schema, model, HydratedDocument, Model } from 'mongoose'
import bcryptjs from 'bcryptjs'
import { REGEX, INVALID_USERNAMES } from '../constants'
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken
} from '../utils/auth_util.js'
import { ApiError } from '../utils/ApiError'
import { User } from '../types/user.types'

type UserDocument = User & {
  password: string
  refreshToken: string
}

interface IUserMethods {
  comparePassword(password: string): Promise<boolean>
  getAccessToken(): string
  getRefreshToken(): string
}

interface UserModel extends Model<UserDocument, object, IUserMethods> {
  findByUsername(
    name: string
  ): Promise<HydratedDocument<UserDocument, IUserMethods>>
  findByEmail(
    name: string
  ): Promise<HydratedDocument<UserDocument, IUserMethods>>
  findByUsernameOrEmail(
    name: string
  ): Promise<HydratedDocument<UserDocument, IUserMethods>>
}

// And a schema that knows about IUserMethods
const userSchema = new Schema<UserDocument, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      index: true,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, 'Username is required'],
      minLength: [4, 'Username must contain at least 4 characters'],
      maxLength: [20, 'Username should not contain more than 20 characters'],
      match: [
        REGEX.ALPHANUMERIC,
        'Username should contain only letters and numbers'
      ],
      validate: {
        validator: function (value) {
          return !INVALID_USERNAMES.includes(value.toLowerCase())
        },
        message: 'Invalid username'
      }
    },
    fullName: {
      type: String,
      trim: true,
      // required: [true, "Name is required"],
      maxLength: [30, 'Name should not contain more than 30 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Email is required'],
      match: [REGEX.EMAIL, 'Invalid email'],
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password is required']
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true,
    statics: {
      findByUsername(username) {
        return this.findOne({ username })
      },
      findByEmail(email) {
        return this.findOne({ email })
      },
      findByUsernameOrEmail(usernameOrEmail) {
        return this.findOne({
          $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
        })
      }
    }
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  if (this.password.length < 4) {
    throw new ApiError('Password must contain at least 4 characters')
  }
  this.password = await bcryptjs.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = async function (password: string) {
  return await comparePassword(password, this.password)
}

userSchema.methods.getAccessToken = function () {
  return generateAccessToken({
    _id: this._id.toString(),
    email: this.email,
    username: this.username,
    fullName: this.fullName
  })
}

userSchema.methods.getRefreshToken = function () {
  return generateRefreshToken({
    _id: this._id.toString()
  })
}

userSchema.set('toJSON', {
  transform: (_, ret: Partial<UserDocument>) => {
    delete ret.password
    delete ret.refreshToken
    return ret
  }
})

const User = model<UserDocument, UserModel>('User', userSchema)

export default User
