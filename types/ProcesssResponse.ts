export type ProcessResponse={
    processId:string;
    title:string;
    description:string;
    status:string;
    picture:string;
    seller:{
        sellerId:string
        sellerName:string
        sellerPicture:string|null
    }
    user:{
        userId:string
        userName:string
        pfp:string|null
    }
}