import { AttachmentDto } from "./AttachmentDTO"

export type MessageResponse = {
    messageId: string
    message: string
    senderId: string
    attachments: AttachmentDto[] | null
    sent: boolean
    createdAt: string
    updatedAt: string | null
    deletedAt: string | null
}