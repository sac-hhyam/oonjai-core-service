import type {UUID} from "@type/uuid"
import type {CaretakerDTO} from "@entity/CaretakerDTO"

export class Caretaker {
private id: UUID | undefined
private userId: UUID
private bio: string
private specialization: string
private hourlyRate: number
private currency: string
private experience: number
private rating: number
private reviewCount: number
private isVerified: boolean
private isAvailable: boolean
private contactInfo: string
private permission: string

constructor(caretakerDTOLike: CaretakerDTO)
  constructor(userId: UUID, bio: string, specialization: string, hourlyRate: number, currency: string, experience: number, rating: number, reviewCount: number, isVerified: boolean, isAvailable: boolean, contactInfo: string, permission: string, id?: UUID)

  constructor(...args: [CaretakerDTO] | [UUID, string, string, number, string, number, number, number, boolean, boolean, string, string, UUID?]) {
    if (typeof args[0] === "object" && "userId" in args[0]) {
      const dto = args[0] as CaretakerDTO
      this.id = dto.id
      this.userId = dto.userId
      this.bio = dto.bio
      this.specialization = dto.specialization
      this.hourlyRate = dto.hourlyRate
      this.currency = dto.currency
      this.experience = dto.experience
      this.rating = dto.rating
      this.reviewCount = dto.reviewCount
      this.isVerified = dto.isVerified
      this.isAvailable = dto.isAvailable
      this.contactInfo = dto.contactInfo
      this.permission = dto.permission
      return
    }

    const arr = args as [UUID, string, string, number, string, number, number, number, boolean, boolean, string, string, UUID?]
    this.userId = arr[0]
    this.bio = arr[1]
    this.specialization = arr[2]
    this.hourlyRate = arr[3]
    this.currency = arr[4]
    this.experience = arr[5]
    this.rating = arr[6]
    this.reviewCount = arr[7]
    this.isVerified = arr[8]
    this.isAvailable = arr[9]
    this.contactInfo = arr[10]
    this.permission = arr[11]
    this.id = arr[12]
  }

  public isNew(): boolean {
    return !this.id
  }

  public getId(): UUID | undefined {
    return this.id
  }

  public toDTO(): CaretakerDTO {
    return {
      id: this.id,
      userId: this.userId,
      bio: this.bio,
      specialization: this.specialization,
      hourlyRate: this.hourlyRate,
      currency: this.currency,
      experience: this.experience,
      rating: this.rating,
      reviewCount: this.reviewCount,
      isVerified: this.isVerified,
      isAvailable: this.isAvailable,
      contactInfo: this.contactInfo,
      permission: this.permission,
    }
  }

  public setProfile(data: Partial<CaretakerDTO>) {
    if (data.bio !== undefined) this.bio = data.bio
    if (data.specialization !== undefined) this.specialization = data.specialization
    if (data.hourlyRate !== undefined) this.hourlyRate = data.hourlyRate
    if (data.currency !== undefined) this.currency = data.currency
    if (data.contactInfo !== undefined) this.contactInfo = data.contactInfo
  }
}