import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const JWT_SECRET: any = process.env.JWT_SEC

export function verifyAccessToken(token: string) {
  const secret = JWT_SECRET

  try {
    const decoded = jwt.verify(token, secret)
    return { success: true, data: decoded }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
