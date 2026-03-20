import type {UUID} from "@type/uuid"

export interface CaretakerDTO {
id: UUID | undefined
userId: UUID
bio: string
specialization: string
hourlyRate: number
currency: string
experience: number
rating: number
reviewCount: number
isVerified: boolean
isAvailable: boolean
contactInfo: string
permission: string
}