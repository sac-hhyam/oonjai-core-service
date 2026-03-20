import type {UUID} from "@type/uuid"
import type {Caretaker} from "@entity/Caretaker"
import type {CaretakerFilter} from "@type/caretaker"

export interface ICaretakerRepository {
findById(id: UUID): Caretaker | undefined
  findAvailable(filters: CaretakerFilter): Caretaker[]
  insert(caretaker: Caretaker): UUID
  save(caretaker: Caretaker): boolean
}