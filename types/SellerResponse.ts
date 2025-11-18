import { UserResponse } from "./UserResponse"

export type SellerResponse={
    sellerId:string
    sellerName:string
    owner:UserResponse,
    rating:number
    clients:number
    banner:string | null
    sellerPicture:string
    description:string | null
    createdAt:string
}