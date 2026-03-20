import type {ICaretakerRepository} from "@repo/ICaretakerRepository"
import type {IService} from "@serv/IService"
import type {UUID} from "@type/uuid"
import type {CaretakerDTO} from "@entity/CaretakerDTO"
import type {CaretakerFilter} from "@type/caretaker"
import {Caretaker} from "@entity/Caretaker"

export class CaretakerService implements IService {
private caretakerRepo: ICaretakerRepository

constructor(caretakerRepo: ICaretakerRepository) {
    this.caretakerRepo = caretakerRepo
  }

  public getServiceId(): string {
    return "CaretakerService"
  }

  public getAvailableCaretakers(filters: CaretakerFilter): Caretaker[] {
    return this.caretakerRepo.findAvailable(filters)
  }

  public getCaretakerById(id: UUID): Caretaker | undefined {
    return this.caretakerRepo.findById(id)
  }

  public updateProfile(caretakerId: UUID, data: Partial<CaretakerDTO>): void {
    const caretaker = this.caretakerRepo.findById(caretakerId)
    if (!caretaker) {
      throw new Error("caretaker not found")
    }

    caretaker.setProfile(data)
    this.caretakerRepo.save(caretaker)
  }
}