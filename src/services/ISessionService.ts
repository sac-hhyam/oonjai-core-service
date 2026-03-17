import type {IService} from "@serv/IService"
import type {User} from "@entity/User"
import type {UUID} from "@type/uuid"
import type {Session} from "@entity/Session"
import type {JWTPayload, SessionToken} from "@type/session"

export interface ISessionService extends IService {
  validate(token: string): Promise<JWTPayload | null>
  createSession(userId: UUID | string): Promise<string>
  createRefreshToken(userId: UUID | string): Promise<string>
  revokeToken(token: string): void
  /** Resolves a raw bearer token into a Session entity. Returns null if invalid or expired. */
  resolveSession(token: string): Promise<Session | null>
  refreshToken(token: string): Promise<SessionToken>
}
