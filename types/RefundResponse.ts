import { SellerResponse } from "./SellerResponse"
import { UserResponse } from "./UserResponse"

export type RefundResponse = {
    refundId:string
    processId:string
    message:string
    status:string
    seller:SellerResponse
    user:UserResponse
}