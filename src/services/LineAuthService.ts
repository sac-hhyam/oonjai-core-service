import type {IService} from "@serv/IService"

export interface LineTokenResponse {
  access_token: string
  expires_in: number
  id_token?: string
  refresh_token: string
  scope: string
  token_type: string
}

export interface LineUserProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

interface PendingState {
  expiry: number
  /** Frontend URL to redirect to after a successful callback. */
  redirectUrl?: string
}

export type StateValidationResult =
  | { valid: true; redirectUrl?: string }
  | { valid: false }

export class LineAuthService implements IService {
  private static readonly AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize"
  private static readonly TOKEN_URL = "https://api.line.me/oauth2/v2.1/token"
  private static readonly PROFILE_URL = "https://api.line.me/v2/profile"

  // In-memory CSRF state store: state -> { expiry, redirectUrl }
  private readonly pendingStates = new Map<string, PendingState>()

  constructor(
    private readonly channelId: string,
    private readonly channelSecret: string,
  ) {}

  public getServiceId(): string {
    return "LineAuthService"
  }

  public getRedirectUri(): string {
    return new URL("/auth/line/callback", process.env["PUBLIC_SERVICE_URL"] ?? "http://localhost:3000").href
  }

  /**
   * Generate the LINE authorization URL with a new CSRF state token.
   * @param redirectUrl - Optional frontend URL to return to after the callback.
   */
  public buildAuthUrl(redirectUrl?: string): string {
    const state = crypto.randomUUID()
    this.pendingStates.set(state, {expiry: Date.now() + 10 * 60 * 1000, redirectUrl}) // 10-min TTL
    this.cleanExpiredStates()

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.channelId,
      redirect_uri: this.getRedirectUri(),
      state,
      scope: "profile openid",
    })

    return `${LineAuthService.AUTH_URL}?${params.toString()}`
  }

  /**
   * Validate and consume a state token (one-time use, prevents CSRF).
   * Returns the stored redirectUrl alongside the validity result.
   */
  public validateState(state: string): StateValidationResult {
    const entry = this.pendingStates.get(state)
    if (!entry || Date.now() > entry.expiry) return {valid: false}
    this.pendingStates.delete(state)
    return {valid: true, redirectUrl: entry.redirectUrl}
  }

  /**
   * Exchange the authorization code for LINE access/refresh tokens.
   */
  public async exchangeCodeForToken(code: string): Promise<LineTokenResponse> {
    const res = await fetch(LineAuthService.TOKEN_URL, {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.getRedirectUri(),
        client_id: this.channelId,
        client_secret: this.channelSecret,
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`LINE token exchange failed (${res.status}): ${detail}`)
    }

    return res.json() as Promise<LineTokenResponse>
  }

  /**
   * Fetch the authenticated user's LINE profile using an access token.
   */
  public async getUserProfile(accessToken: string): Promise<LineUserProfile> {
    const res = await fetch(LineAuthService.PROFILE_URL, {
      headers: {Authorization: `Bearer ${accessToken}`},
    })

    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`LINE profile fetch failed (${res.status}): ${detail}`)
    }

    return res.json() as Promise<LineUserProfile>
  }

  private cleanExpiredStates(): void {
    const now = Date.now()
    for (const [state, entry] of this.pendingStates) {
      if (now > entry.expiry) this.pendingStates.delete(state)
    }
  }
}
