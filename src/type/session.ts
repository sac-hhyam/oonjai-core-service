import type {UserDTO} from "@entity/UserDTO"


export interface SessionToken {
  accessToken: string
  refreshToken: string
  /** Seconds until the access token expires */
  expiresIn: number
}

export type TokenType = "access" | "refresh"
export interface JWTPayload {
  userId: string
  type: TokenType
  iat: number
  exp: number
}