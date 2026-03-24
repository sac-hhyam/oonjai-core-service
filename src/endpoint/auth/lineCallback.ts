import {type Endpoint, internalError, redirectTo, sessionCookies, withCookies} from "@http/HttpContext"
import type {LineAuthService} from "@serv/LineAuthService"
import type {AuthService} from "@serv/AuthService"
import {RoleEnum} from "@type/user"

export const lineCallback: Endpoint<[LineAuthService, AuthService]> = {
  method: "GET",
  path: "/auth/line/callback",
  handler: async (ctx, [lineService, authService], _session) => {
    const {code, state, error} = ctx.query

    if (error) {
      return internalError()
    }

    if (!code || !state) {
      return internalError("missing_code_or_state")
    }

    // Validate state and recover the redirect_url the client originally supplied
    const stateResult = lineService.validateState(state)
    if (!stateResult.valid) {
      return internalError("invalid_state")
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

      // Redirect to the URL requested by the client, or fall back to FRONTEND_URL env var
      const destination = stateResult.redirectUrl ?? process.env["FRONTEND_URL"] ?? "http://localhost:3000"
      console.log(destination)
      return withCookies(
        sessionCookies(sessionToken.accessToken, sessionToken.refreshToken),
        redirectTo(destination)
      )
    } catch {
      return internalError("auth error")
    }
  },
}
