export type ConversationResponse = {
    name: string
    conversationId: string
    createdAt: string
    updatedAt: string | null
    picture: string
    latestMessage:string | null,
    sellerName:string|null
}