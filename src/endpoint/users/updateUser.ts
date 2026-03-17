import {type Endpoint, unauthorized} from "@http/HttpContext"
import {ok} from "@http/HttpContext"
import type {UserService} from "@serv/UserService"
import {UUID} from "@type/uuid"

export const updateUser: Endpoint<[UserService]> = {
  method: "PUT",
  path: "/users/update",
  handler: async (ctx, [service], session) => {
    const user = session?.getUser()
    if (!user) {
      return unauthorized("User must be logged in to update user")
    }

    const body = ctx.body as Record<string, unknown>

    service.updateUser(new UUID(session?.getUserId()), {
      firstname: body?.firstname as string | undefined,
      lastname: body?.lastname as string | undefined,
      email: body?.email as string | undefined,
    })

    return ok()
  },
}
