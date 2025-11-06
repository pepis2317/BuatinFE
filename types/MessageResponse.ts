export type MessageResponse = {
    messageId: string
    message: string
    senderId: string
    hasAttachments: boolean
    createdAt: string
    updatedAt: string | null
    DeletedAt: string | null
}