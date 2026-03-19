import type {Endpoint} from "@http/HttpContext"
import {redirectTo} from "@http/HttpContext"
import type {LineAuthService} from "@serv/LineAuthService"

export const lineLogin: Endpoint<[LineAuthService]> = {
  method: "GET",
  path: "/auth/line/login",
  handler: async (_ctx, [lineService], _session) => {
    const authUrl = lineService.buildAuthUrl()
    return redirectTo(authUrl)
  },
}
