import { Types, HydratedDocument, Model, Document } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  fullName: string
  email: string
  password: string
  refreshToken: string
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>
  getAccessToken(): string
  getRefreshToken(): string
}

export interface UserModel extends Model<IUser, object, IUserMethods> {
  findByUsername(name: string): Promise<HydratedDocument<IUser, IUserMethods>>
  findByEmail(name: string): Promise<HydratedDocument<IUser, IUserMethods>>
  findByUsernameOrEmail(
    name: string
  ): Promise<HydratedDocument<IUser, IUserMethods>>
}
