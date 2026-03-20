import type {ICaretakerRepository} from "@repo/ICaretakerRepository"
import type {ITestDatabase} from "../lib/TestDatabase"
import type {CaretakerFilter} from "@type/caretaker"
import {Caretaker} from "@entity/Caretaker"
import type {UUID} from "@type/uuid"

export class TestCaretakerRepository implements ICaretakerRepository {
constructor(private db: ITestDatabase) {}

  public findById(id: UUID): Caretaker | undefined {
    try {
      const dto = this.db.get("caretaker", id.toString())
      return new Caretaker(dto)
    } catch {
      return undefined
    }
  }

  public findAvailable(filters: CaretakerFilter): Caretaker[] {
    let results = this.db.getAll("caretaker")
      .map(dto => new Caretaker(dto))
      .filter(c => c.toDTO().isAvailable)

    if (filters.specialization) {
      results = results.filter(c =>
        c.toDTO().specialization.toLowerCase().includes(filters.specialization!.toLowerCase())
)
}
if (filters.minRating !== undefined) {
      results = results.filter(c => c.toDTO().rating >= filters.minRating!)
    }
    if (filters.minExperience !== undefined) {
      results = results.filter(c => c.toDTO().experience >= filters.minExperience!)
    }
    if (filters.maxHourlyRate !== undefined) {
      results = results.filter(c => c.toDTO().hourlyRate <= filters.maxHourlyRate!)
    }

    if (filters.sortBy === "rating") {
      results.sort((a, b) => b.toDTO().rating - a.toDTO().rating)
    } else if (filters.sortBy === "experience") {
      results.sort((a, b) => b.toDTO().experience - a.toDTO().experience)
    } else if (filters.sortBy === "price_asc") {
      results.sort((a, b) => a.toDTO().hourlyRate - b.toDTO().hourlyRate)
    } else if (filters.sortBy === "price_desc") {
      results.sort((a, b) => b.toDTO().hourlyRate - a.toDTO().hourlyRate)
    }

    return results
  }

  public insert(caretaker: Caretaker): UUID {
    return this.db.insert("caretaker", caretaker.toDTO())
  }

  public save(caretaker: Caretaker): boolean {
    this.db.update("caretaker", caretaker.getId() as string, caretaker.toDTO())
    return true
  }
}