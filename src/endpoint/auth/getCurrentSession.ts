import type {Endpoint} from "@http/HttpContext"
import {ok, unauthorized} from "@http/HttpContext"

// No service needed — the Router already resolved the session entity
export const getCurrentSession: Endpoint<[]> = {
  method: "GET",
  path: "/auth/session",
  handler: async (_ctx, _services, session) => {
    if (!session) return unauthorized()
    return ok(session.toDTO())
  },
}
