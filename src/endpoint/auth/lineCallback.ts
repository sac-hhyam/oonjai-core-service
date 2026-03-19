import type {Endpoint} from "@http/HttpContext"
import {redirectTo} from "@http/HttpContext"
import type {LineAuthService} from "@serv/LineAuthService"
import type {AuthService} from "@serv/AuthService"
import {RoleEnum} from "@type/user"

export const lineCallback: Endpoint<[LineAuthService, AuthService]> = {
  method: "GET",
  path: "/auth/line/callback",
  handler: async (ctx, [lineService, authService], _session) => {
    const {code, state, error} = ctx.query

    if (error) {
      return redirectTo(`/line-login.html?error=${encodeURIComponent(error)}`)
    }

    if (!code || !state) {
      return redirectTo("/line-login.html?error=missing_code_or_state")
    }

    if (!lineService.validateState(state)) {
      return redirectTo("/line-login.html?error=invalid_state")
    }

    try {
      const lineToken = await lineService.exchangeCodeForToken(code)
      const profile = await lineService.getUserProfile(lineToken.access_token)

      // Synthesize a local email from the LINE userId (LINE does not expose email by default)
      const lineEmail = `${profile.userId}@line.local`

      // Find existing user or create a new one on first login
      let sessionToken
      try {
        sessionToken = await authService.login(lineEmail)
      } catch {
        const [firstname, ...rest] = profile.displayName.split(" ")
        await authService.register(
          lineEmail,
          lineToken.access_token,
          firstname ?? profile.displayName,
          rest.join(" ") || "LINE",
          RoleEnum.ADULTCHILD
        )
        sessionToken = await authService.login(lineEmail)
      }

      const params = new URLSearchParams({
        access_token: sessionToken.accessToken,
        refresh_token: sessionToken.refreshToken,
        display_name: profile.displayName,
        ...(profile.pictureUrl ? {picture_url: profile.pictureUrl} : {}),
      })

      return redirectTo(`/line-login.html?${params.toString()}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "authentication failed"
      return redirectTo(`/line-login.html?error=${encodeURIComponent(message)}`)
    }
  },
}
