import type {User} from "../entity/User"
import type {UUID} from "../type/uuid"
import type {CaretakerFilter} from "@type/caretaker"

export interface IUserRepository {
  save(user: User): [boolean, UUID?]
  delete(user: User): void
  findById(id: UUID): User | undefined
  findByEmail(email: string): User | undefined
  findAvailableCaretaker(filter: CaretakerFilter): User[] | undefined
}