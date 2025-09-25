export type SellerResponse={
    sellerId:string
    sellerName:string
    owner:{
        userId:string,
        userName:string,
    },
    rating:number
    clients:number
    banner:string | null
    sellerPicture:string
}