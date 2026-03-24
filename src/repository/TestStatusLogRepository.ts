import type {IStatusLogRepository} from "@repo/IStatusLogRepository"
import type {ITestDatabase} from "../lib/TestDatabase"
import {StatusLog} from "@entity/StatusLog"
import type {UUID} from "@type/uuid"

export class TestStatusLogRepository implements IStatusLogRepository {
constructor(private db: ITestDatabase) {}

  public save(log: StatusLog): boolean {
    this.db.update("statusLog", log.getId() as string, log.toDTO())
    return true
  }

  public findById(id: UUID): StatusLog | undefined {
    return this.db.get("statusLog", id.toString())
  }

  public findByBookingId(bookingId: string): StatusLog[] {
    return this.db.getAll("statusLog")
      .filter(dto => dto.bookingId === bookingId)
      .map(dto => new StatusLog(dto))
  }

  public insert(log: StatusLog): UUID {
    return this.db.insert("statusLog", log.toDTO())
  }
}