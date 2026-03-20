import {type Endpoint, unauthorized, notFound, ok} from "@http/HttpContext"
import type {CaretakerService} from "@serv/CaretakerService"
import {UUID} from "@type/uuid"

export const getCaretakerById: Endpoint<[CaretakerService]> = {
method: "GET",
path: "/caretakers/:caretakerId",
handler: async (ctx, [service], session) => {
    const user = session?.getUser()
    if (!user) {
      return unauthorized("User must be logged in")
    }

    const caretaker = service.getCaretakerById(new UUID(ctx.params?.caretakerId as string))
    if (!caretaker) {
      return notFound("caretaker not found")
    }

    return ok(caretaker.toDTO())
  },
}