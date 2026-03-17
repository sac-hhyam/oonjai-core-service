import type {Endpoint} from "@http/HttpContext"
import {badRequest, created} from "@http/HttpContext"
import type {AuthService} from "@serv/AuthService"
import {RoleEnum} from "@type/user"

export const register: Endpoint<[AuthService]> = {
  method: "POST",
  path: "/auth/register",
  handler: async (ctx, [service], _session) => {
    const body = ctx.body as Record<string, unknown>

    if (!body?.email || !body?.firstname || !body?.lastname || !body?.role) {
      return badRequest("email, firstname, lastname and role are required")
    }

    if (!Object.values(RoleEnum).includes(body.role as RoleEnum)) {
      return badRequest(`role must be one of: ${Object.values(RoleEnum).join(", ")}`)
    }

    const user = await service.register(
      body.email as string,
      body.oauthToken as string,
      body.firstname as string,
      body.lastname as string,
      body.role as RoleEnum
    )

    return created(user.toDTO())
  },
}
