import type {User} from "@entity/User"
import type {UserDTO} from "@entity/UserDTO"

export interface SessionDTO {
  userId: string
  user: UserDTO
  issuedAt: number
  expiresAt: number
}

export class Session {
  /** The raw bearer token this session was resolved from */
  private token: string
  private userId: string
  private user: User
  private issuedAt: number
  private expiresAt: number

  constructor(token: string, userId: string, user: User, issuedAt: number, expiresAt: number) {
    this.token = token
    this.user = user
    this.userId = userId
    this.issuedAt = issuedAt
    this.expiresAt = expiresAt
  }

  public getUser(): User {
    return this.user
  }

  public getUserId(): string {
    return this.userId
  }

  public isExpired(): boolean {
    return Date.now() > this.expiresAt * 1000
  }

  public getToken(): string {
    return this.token
  }

  /** Returns a plain serialisable object — use this instead of passing the class instance to ok(). */
  public toDTO(): SessionDTO {
    return {
      userId: this.userId,
      user: this.user.toDTO(),
      issuedAt: this.issuedAt,
      expiresAt: this.expiresAt,
    }
  }
}
