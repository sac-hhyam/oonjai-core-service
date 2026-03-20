import {type Endpoint, unauthorized, ok} from "@http/HttpContext"
import type {CaretakerService} from "@serv/CaretakerService"
import {RoleEnum} from "@type/user"
import {UUID} from "@type/uuid"

export const updateCaretakerProfile: Endpoint<[CaretakerService]> = {
method: "PUT",
path: "/caretakers/profile",
handler: async (ctx, [service], session) => {
    const user = session?.getUser()
    if (!user) {
      return unauthorized("User must be logged in")
    }

    if (user.toDTO().role !== RoleEnum.CARETAKER) {
      return { status: 403, body: { message: "Only caretakers can update a caretaker profile" } }
    }

    const body = ctx.body as Record<string, unknown>
    service.updateProfile(new UUID(user.getId() as string), body)

    return ok({message: "profile updated"})
  },
}