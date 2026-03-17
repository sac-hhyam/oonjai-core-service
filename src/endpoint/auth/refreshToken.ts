import type {Endpoint} from "@http/HttpContext"
import {badRequest, ok, unauthorized} from "@http/HttpContext"
import type {AuthService} from "@serv/AuthService"
import type {JWTSessionService} from "@serv/JWTSessionService"

export const refreshToken: Endpoint<[JWTSessionService]> = {
  method: "POST",
  path: "/auth/refresh",
  handler: async (ctx, [service], _session) => {
    const body = ctx.body as Record<string, unknown>

    if (!body?.refreshToken) {
      return badRequest("refreshToken is required")
    }

    try {
      const token = await service.refreshToken(body.refreshToken as string)
      return ok(token)
    } catch {
      return unauthorized("invalid or expired refresh token")
    }
  },
}
